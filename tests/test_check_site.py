"""tools/ci/check_site.py-এর ইউনিট টেস্ট — গেট নিজেই যেন ভুল না বলে।"""
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools" / "ci"))

import check_site  # noqa: E402


class LinkResolutionTests(unittest.TestCase):
    def test_external_and_special_targets_are_skipped(self):
        base = ROOT / "index.html"
        for value in (
            "https://example.org/x", "//cdn.example.org/x.js", "data:image/png;base64,AA",
            "mailto:a@b.c", "tel:+8801000000000", "#explore", "", "javascript:void(0)",
        ):
            self.assertIsNone(check_site.local_target(value, base), value)

    def test_relative_and_root_relative_paths_resolve(self):
        base = ROOT / "history.html"
        self.assertEqual(check_site.local_target("index.html", base), ROOT / "index.html")
        self.assertEqual(check_site.local_target("#x", base), None)
        self.assertEqual(check_site.local_target("data/counts.json?v=1", base), ROOT / "data" / "counts.json")
        self.assertEqual(check_site.local_target("/assets/brand/logo.svg", base), ROOT / "assets" / "brand" / "logo.svg")

    def test_query_strings_do_not_break_lookup(self):
        base = ROOT / "index.html"
        target = check_site.local_target("charyabhumi.css?v=20261031c", base)
        self.assertEqual(target.name if target else None, "charyabhumi.css")


class ParserTests(unittest.TestCase):
    def test_duplicate_ids_and_refs_are_collected(self):
        parser = check_site.PageParser()
        parser.feed('<div id="a"></div><div id="a"></div><a href="missing.html">x</a>')
        self.assertEqual(parser.ids["a"], 2)
        self.assertEqual(len(parser.refs), 1)

    def test_alt_rules(self):
        parser = check_site.PageParser()
        parser.feed('<img src="a.png"><img src="b.png" alt=""><img src="c.png" alt="বর্ণনা">')
        self.assertEqual([ok for ok, _ in parser.images], [False, True, True])

    def test_aria_hidden_svg_is_decorative(self):
        parser = check_site.PageParser()
        parser.feed('<div aria-hidden="true"><svg role="img"></svg></div><svg role="img"></svg>')
        self.assertEqual(len(parser.images), 1)

    def test_viewport_detection(self):
        with_viewport = check_site.PageParser()
        with_viewport.feed('<meta name="viewport" content="width=device-width, initial-scale=1">')
        self.assertTrue(with_viewport.has_viewport)
        without = check_site.PageParser()
        without.feed('<meta charset="utf-8">')
        self.assertFalse(without.has_viewport)


if __name__ == "__main__":
    unittest.main()
