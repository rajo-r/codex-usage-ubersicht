import json
import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

SCRIPT = Path(__file__).resolve().parents[1] / 'codex-usage.widget' / 'fetch-usage.py'

class CollectorTests(unittest.TestCase):
    def test_empty_sessions(self):
        with tempfile.TemporaryDirectory() as tmp:
            env = dict(os.environ, CODEX_HOME=tmp)
            data = json.loads(subprocess.check_output([sys.executable, str(SCRIPT)], env=env))
            self.assertTrue(data['ok'])
            self.assertEqual(data['week7']['total'], 0)
            self.assertEqual(len(data['series']), 30)

if __name__ == '__main__':
    unittest.main()
