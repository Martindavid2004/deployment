import sys
import os
sys.path.insert(0, os.getcwd())
import uvicorn
from app.main import app
print('Starting server...')
uvicorn.run(app, host='0.0.0.0', port=8000, log_level='info')