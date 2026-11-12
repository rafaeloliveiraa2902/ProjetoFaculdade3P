import sys
import unittest
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from shapely.geometry import GeometryCollection, LineString, Point, box
from prepare_map import polygonal, feature


class MapGeometryTests(unittest.TestCase):
    def test_collapsed_components_do_not_become_map_markers(self):
        source = GeometryCollection([box(0, 0, 1, 1), Point(2, 2), LineString([(3, 3), (4, 4)])])
        result = polygonal(source)
        self.assertEqual(result.geom_type, 'Polygon')
        self.assertEqual(result.area, 1)
        self.assertTrue(polygonal(Point(1, 1)).is_empty)

    def test_display_simplification_preserves_small_polygon(self):
        item = feature(box(-49, -16, -48.99999, -15.99999), {'id': 'small'})
        self.assertEqual(item['geometry']['type'], 'Polygon')
        self.assertEqual(item['properties']['id'], 'small')


if __name__ == '__main__':
    unittest.main()
