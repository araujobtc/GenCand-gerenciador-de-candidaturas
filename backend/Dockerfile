# Etapa 1: compila o projeto
FROM eclipse-temurin:25-jdk AS build
WORKDIR /app
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw -B -q dependency:go-offline
COPY src ./src
RUN ./mvnw -B -q package -DskipTests

# Etapa 2: imagem final, so com o Java necessario para rodar
FROM eclipse-temurin:25-jre
WORKDIR /app
RUN useradd --system --uid 1001 app
COPY --from=build /app/target/*.jar app.jar
USER app

# Ajustes para caber nos 512 MB do Render gratuito:
#  - MaxRAMPercentage limita o heap a uma parte da memoria do container
#  - SerialGC usa menos memoria que o coletor padrao em maquinas pequenas
#  - UseCompactObjectHeaders reduz o tamanho dos objetos (Java 25)
ENV JAVA_OPTS="-XX:MaxRAMPercentage=65 -XX:+UseSerialGC -XX:+UseCompactObjectHeaders -XX:+ExitOnOutOfMemoryError"
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar app.jar"]
