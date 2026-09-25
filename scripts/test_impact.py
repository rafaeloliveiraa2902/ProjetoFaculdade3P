import unittest
from compute_impact import clipped_union, measure
from shapely.geometry import box
from shapely import union_all

class AreaTests(unittest.TestCase):
    def test_overlaps_and_outside_area_not_double_counted(self):
        unit = box(0,0,100,100)
        events = [box(-100,0,60,100),box(40,0,80,100),box(-100,0,60,100)]
        result = measure(unit,clipped_union(unit,events))
        self.assertAlmostEqual(result['percent'],80)
        self.assertAlmostEqual(result['areaHa'],0.8)

    def test_no_intersection_and_complete_coverage(self):
        unit=box(0,0,100,100)
        self.assertEqual(measure(unit,clipped_union(unit,[]))['percent'],0)
        self.assertEqual(measure(unit,clipped_union(unit,[box(200,200,300,300)]))['percent'],0)
        self.assertEqual(measure(unit,clipped_union(unit,[box(-1,-1,101,101)]))['percent'],100)

    def test_combined_fire_and_deforestation_uses_union(self):
        unit=box(0,0,100,100)
        fire=clipped_union(unit,[box(0,0,60,100)])
        loss=clipped_union(unit,[box(40,0,80,100)])
        self.assertAlmostEqual(measure(unit,union_all([fire,loss]))['percent'],80)

if __name__ == '__main__':
    unittest.main()
