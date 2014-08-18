Policy Editor
==

## Maven commands:

**Update Dependencies:** mvn versions:display-dependency-updates versions:display-plugin-updates

**Download sources:** mvn dependency:resolve -Dclassifier=sources

**Download javadoc:** mvn dependency:resolve -Dclassifier=javadoc

**Run Jetty:** mvn -DskipTests=true clean jetty:run

**Make sources and javadoc:** mvn source:jar source:test-jar javadoc:javadoc javadoc:test-javadoc

**Create site:** mvn site
