SOLR_JAVA_HOME=$JAVA_HOME

SOLR_JAVA_MEM=${'"-Xmx' + Math.floor(env.ranger.resources.memoryInMb / 2) + 'm"'}

GC_LOG_OPTS="-verbose:gc"

GC_TUNE="-XX:NewRatio=3 \
-XX:SurvivorRatio=4 \
-XX:TargetSurvivorRatio=90 \
-XX:MaxTenuringThreshold=8 \
-XX:+UseConcMarkSweepGC \
-XX:+UseParNewGC \
-XX:ConcGCThreads=4 -XX:ParallelGCThreads=4 \
-XX:+CMSScavengeBeforeRemark \
-XX:PretenureSizeThreshold=64m \
-XX:+UseCMSInitiatingOccupancyOnly \
-XX:CMSInitiatingOccupancyFraction=50 \
-XX:CMSMaxAbortablePrecleanTime=6000 \
-XX:+CMSParallelRemarkEnabled \
-XX:+ParallelRefProcEnabled"

ENABLE_REMOTE_JMX_OPTS="false"

SOLR_HOME=/opt/mr3-run/ranger/solr/ranger_audit_server

SOLR_DATA_HOME=${env.consts.dir.rangerWork + "/ranger/solr/ranger_audits/data"}

LOG4J_PROPS=$SOLR_HOME/resources/log4j2.xml

#SOLR_LOG_LEVEL=INFO

SOLR_LOGS_DIR=${env.consts.dir.rangerWork + "/log/solr/ranger_audits"}

SOLR_HOST=${env.ranger.enableKerberos && env.secret.kerberosSecret !== undefined && env.secret.kerberosSecret.ranger !== undefined ? env.secret.kerberosSecret.ranger.domain : ""}
SOLR_PORT=${env.consts.ranger.auditPort}

SOLR_SSL_ENABLED=${env.hive.enableSslInternal}
SOLR_SSL_KEY_STORE=${env.secret.ssl !== undefined ? env.consts.dir.rangerKeytab + "/" + env.secret.ssl.truststore : ""}
SOLR_SSL_KEY_STORE_PASSWORD=${env.secret.sslPassword}
SOLR_SSL_TRUST_STORE=${env.secret.ssl !== undefined ? env.consts.dir.rangerKeytab + "/" + env.secret.ssl.truststore : ""}
SOLR_SSL_TRUST_STORE_PASSWORD=${env.secret.sslPassword}
SOLR_SSL_NEED_CLIENT_AUTH=false
SOLR_SSL_WANT_CLIENT_AUTH=false
SOLR_SSL_CHECK_PEER_NAME=true
SOLR_SSL_KEY_STORE_TYPE=JKS
SOLR_SSL_TRUST_STORE_TYPE=JKS

SOLR_AUTH_TYPE=${'"' + (env.ranger.enableKerberos ? "kerberos" : "basic") + '"'}
SOLR_AUTHENTICATION_OPTS=${'"' + env.secret.solrAuthenticationOption + '"'}

SOLR_OPTS="$SOLR_OPTS -Dlog4j2.formatMsgNoLookups=true"

