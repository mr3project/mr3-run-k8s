MR3
===
MR3 is a new execution engine for Hadoop and Kubernetes. Similar in spirit to
MapReduce and Tez, it is a new execution engine with simpler design, better
performance, and more features. MR3 serves as a framework for running jobs on
Hadoop and Kubernetes. MR3 also supports standalone mode which does not require
a resource manager such as Hadoop or Kubernetes.

The main application of MR3 is Hive on MR3. With MR3 as the execution engine,
the user can run Hive not only on Hadoop but also directly on Kubernetes.  By
exploiting standalone mode supported by MR3, the user can run Hive virtually in
any type of cluster regardless of the availability of Hadoop or Kubernetes and
the version of Java installed in the system.

Hive on MR3 is much easier to install and operate than Apache Hive. For
performance, it achieves the speed of Hive-LLAP with no additional
configuration. For executing typical workloads (such as TPC-DS), Hive on MR3 is
indeed faster than Hive-LLAP. We actively maintain Hive on MR3 by backporting
critical patches from Apache Hive.

The other two applications of MR3 are Spark on MR3 and MapReduce on MR3.

MR3 is implemented in Scala.

For the full documentation on MR3 (including Quick Start Guide), please visit:

  https://mr3docs.datamonad.com/

mr3-run-k8s
===========
Code for running Hive/Spark on MR3 on Kubernetes

  /kubernetes - Executable scripts with YAML files, Helm charts

  /typescript - TypeScript code for generating YAML files

For instructions, visit:

  https://mr3docs.datamonad.com/docs/quick/k8s/ 


