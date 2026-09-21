FROM eclipse-temurin:21-jdk

WORKDIR /app

COPY pom.xml .
COPY src ./src

RUN apt-get update && apt-get install -y maven && mvn clean package -DskipTests

EXPOSE 10000

CMD ["sh", "-c", "java -jar target/*.jar --server.port=${PORT:-10000}"]
