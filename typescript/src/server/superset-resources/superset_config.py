SUPERSET_WEBSERVER_PORT = ${env.consts.superset.port}

SECRET_KEY = "MR3SupersetDatabaseSecretKey@02@"

SQLALCHEMY_DATABASE_URI = "sqlite:///${env.consts.dir.supersetWork}/superset/superset.db"

LOG_LEVEL = "INFO"

