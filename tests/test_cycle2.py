import sys
import unittest
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from import_cycle2 import is_goias, get_groups


class Row(dict):
    def __init__(self, oid, **values):
        super().__init__(**values)
        self.oid = oid


class Reader:
    def __init__(self, rows):
        self.rows = rows

    def iterRecords(self, fields):
        return iter(self.rows)


class Cycle2Tests(unittest.TestCase):
    def test_geographic_filter(self):
        self.assertTrue(is_goias('GOIÁS'))
        self.assertTrue(is_goias('GO'))
        self.assertFalse(is_goias('TOCANTINS'))

    def test_prodes_filters_state_and_class(self):
        rows = [Row(1, state='GOIÁS', year=2026, main_class='DESMATAMENTO'),
                Row(2, state='TOCANTINS', year=2026, main_class='DESMATAMENTO'),
                Row(3, state='GOIÁS', year=2025, main_class='RESIDUO')]
        self.assertEqual(dict(get_groups(Reader(rows))), {'2026': [1]})

    def test_alert_period_is_detection_date(self):
        rows = [Row(9, UF='GO', VIEW_DATE='2026-10-27', CLASSNAME='DESMATAMENTO_CR')]
        self.assertEqual(dict(get_groups(Reader(rows), deter=True)), {'2026': [9]})


if __name__ == '__main__':
    unittest.main()
