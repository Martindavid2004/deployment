import importlib, sys
print('python', sys.version)
print('motor spec:', importlib.util.find_spec('motor'))
print('uvicorn spec:', importlib.util.find_spec('uvicorn'))
print('fastapi spec:', importlib.util.find_spec('fastapi'))
print('dnspython spec:', importlib.util.find_spec('dns'))
