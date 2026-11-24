"""Offline tests for scripts/player_images.py: python3 -m unittest scripts/test_player_images.py"""
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import player_images as P  # noqa: E402
from PIL import Image  # noqa: E402

SQUAD_HTML = '''
<a href="/en/football/first-team/players/16286/rodrigo-hernandez-cascante" class="footer-sitemap__nav-link">Rodrigo</a>
<a href="/en/football/first-team/players/19680/gabriel-fernando-de-jesus" class="footer-sitemap__nav-link">Gabriel Jesus</a>
<a href="/en/football/first-team/players/140515/brian-farinas" class="footer-sitemap__nav-link">Brian Fari&ntilde;as</a>
<a href="/en/football/first-team/players/572280/hamza-mohamed-abdelkarim-elsayed-selim" class="footer-sitemap__nav-link">Hamza Abdelkarim</a>
<a href="/en/football/first-team/players/24635/eric-garcia" class="footer-sitemap__nav-link">Eric García</a>
<a href="/en/football/first-team/players/110491/joan-garcia" class="footer-sitemap__nav-link">Joan Garcia</a>
<a href="/en/football/first-team/players/110491/joan-garcia" class="footer-sitemap__nav-link">Joan Garcia</a>
'''


class Slug(unittest.TestCase):
    def test_matches_app_nameToSlug(self):
        # File names that already exist in public/images/players
        for name, slug in [('Álvaro Cortés', 'alvaro-cortes'), ('Marc-Andre ter Stegen', 'marc-andre-ter-stegen'),
                           ('Brian Fariñas', 'brian-farinas'), ('Wojciech Szczesny', 'wojciech-szczesny'),
                           ('Dominik Livaković', 'dominik-livakovic'), ('Iñaki Peña', 'inaki-pena')]:
            self.assertEqual(P.slugify(name), slug)


class Squad(unittest.TestCase):
    def setUp(self):
        self.squad = P.parse_squad(SQUAD_HTML)

    def test_parse_dedupes_and_unescapes(self):
        self.assertEqual(len(self.squad), 6)
        self.assertIn(('Brian Fariñas', '/en/football/first-team/players/140515/brian-farinas'), self.squad)

    def test_match_by_prefix_display_or_slug(self):
        self.assertEqual(P.match_player('Rodri', self.squad)[0], 'Rodrigo')
        self.assertEqual(P.match_player('Hamza Abdelkarim', self.squad)[0], 'Hamza Abdelkarim')
        self.assertEqual(P.match_player('Gabriel Jesus', self.squad)[0], 'Gabriel Jesus')
        self.assertEqual(P.match_player('Brian Farinas', self.squad)[0], 'Brian Fariñas')

    def test_ambiguous_or_absent_is_none(self):
        self.assertIsNone(P.match_player('Garcia', self.squad))  # Eric and Joan
        self.assertIsNone(P.match_player('Tommy Marques', self.squad))
        self.assertIsNone(P.match_player('', self.squad))


class OgImage(unittest.TestCase):
    def test_full_size_url(self):
        page = '<meta property="og:image" content="https://x/00-Gordon.png?width=624&height=368"/>'
        self.assertEqual(P.og_image(page), 'https://x/00-Gordon.png?width=3200')

    def test_generic_share_image_rejected(self):
        self.assertIsNone(P.og_image('<meta property="og:image" content="https://x/i/elements/fcb-share.png"/>'))
        self.assertIsNone(P.og_image('<html></html>'))


class Geometry(unittest.TestCase):
    @staticmethod
    def cutout(w, h, fig_w, fig_h):
        img = Image.new('RGBA', (w, h), (0, 0, 0, 0))
        img.paste(Image.new('RGBA', (fig_w, fig_h), (200, 0, 0, 255)), ((w - fig_w) // 2, 0))
        return img

    def test_prepare_crops_cutout_to_5x6_bottom_aligned(self):
        out = P.prepare(self.cutout(3200, 1800, 1000, 1800))
        self.assertAlmostEqual(out.width / out.height, 1078 / 1280, places=2)
        self.assertEqual(out.mode, 'RGB')
        self.assertEqual(out.getpixel((out.width // 2, out.height - 1)), (200, 0, 0))  # figure touches the bottom
        self.assertEqual(out.getpixel((0, 0)), (255, 255, 255))

    def test_prepare_passes_photos_through(self):
        out = P.prepare(Image.new('RGB', (4894, 3263), (10, 20, 30)))
        self.assertLessEqual(max(out.size), 2400)

    def test_place_tall_figure(self):
        out = P.place(self.cutout(500, 1000, 400, 1000))
        self.assertEqual(out.size, P.SIZE)
        box = out.getchannel('A').getbbox()
        self.assertEqual(box[3], P.SIZE[1])                 # bottom-aligned
        self.assertEqual(box[1], P.TOP_MARGIN)              # head under the top margin
        self.assertLessEqual(abs((box[0] + box[2]) / 2 - P.SIZE[0] / 2), 1)  # centred

    def test_place_wide_figure_fits_width(self):
        box = P.place(self.cutout(2000, 500, 2000, 500)).getchannel('A').getbbox()
        self.assertEqual((box[0], box[2], box[3]), (0, P.SIZE[0], P.SIZE[1]))

    def test_place_empty_raises(self):
        with self.assertRaises(ValueError):
            P.place(Image.new('RGBA', (10, 10), (0, 0, 0, 0)))

    def test_face_crop_is_head_area_on_white(self):
        img = Image.new('RGBA', (1078, 1280), (0, 0, 0, 0))
        out = P.face_crop(img)
        self.assertEqual(out.size, (431, 537))
        self.assertEqual(out.getpixel((0, 0)), (255, 255, 255))

    def test_coverage(self):
        img = Image.new('RGBA', (10, 10), (0, 0, 0, 0))
        img.paste(Image.new('RGBA', (5, 10), (1, 1, 1, 255)), (0, 0))
        self.assertAlmostEqual(P.coverage(img), 0.5)


class Prompt(unittest.TestCase):
    def test_only_the_style_changes(self):
        prompt = P.PROMPT.format(out='x.png', hint='')
        self.assertIn('Keep everything else from image 1 exactly', prompt)
        self.assertIn('Remove all logos', prompt)
        for forced in ('behind his back', 'blue sleeves', 'home shirt'):  # no pose or kit imposed
            self.assertNotIn(forced, prompt)

    def test_hint_is_appended(self):
        self.assertIn('Note: the one in orange', P.PROMPT.format(out='x.png', hint='Note: the one in orange\n'))


class Refresh(unittest.TestCase):
    def test_photo_date_from_url(self):
        self.assertEqual(P.photo_date('https://www.fcbarcelona.com/photo-resources/2026/09/03/f8d9/09-Gabriel_Jesus.png?width=3200'), '2026-09-03')
        self.assertIsNone(P.photo_date('https://x/i/elements/fcb-share.png'))
        self.assertIsNone(P.photo_date(None))

    def test_stale_only_when_official_photo_is_newer(self):
        self.assertTrue(P.is_stale('2026-03-13', '2026-09-03'))
        self.assertFalse(P.is_stale('2026-11-24', '2026-09-03'))  # drawn after the photo came out
        self.assertFalse(P.is_stale('2026-09-03', '2026-09-03'))
        self.assertTrue(P.is_stale(None, '2026-09-03'))           # not committed yet
        self.assertFalse(P.is_stale('2026-03-13', None))          # no dated official photo: leave it

    def test_style_references_are_departed_players(self):
        # A refreshed portrait must never become the style reference for the next run.
        self.assertEqual([r.name for r in P.STYLE_REFS], ['marcus-rashford-profile.webp', 'robert-lewandowski-profile.webp'])


class Cli(unittest.TestCase):
    def test_force_without_only_is_refused(self):
        import subprocess
        r = subprocess.run([sys.executable, str(Path(__file__).parent / 'player_images.py'), '--force'],
                           capture_output=True, text=True)
        self.assertEqual(r.returncode, 2)
        self.assertIn('--force needs --only', r.stderr)


if __name__ == '__main__':
    unittest.main()
