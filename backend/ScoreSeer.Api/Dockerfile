# Build stage: compile the app using the full .NET SDK
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Restore dependencies first (cached if the .csproj does not change)
COPY *.csproj ./
RUN dotnet restore

# Copy the rest of the source code and publish a Release build
COPY . ./
RUN dotnet publish -c Release -o /app/publish

# Runtime stage: run the compiled app using the smaller ASP.NET runtime image
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /app/publish .

# Listen on port 8080 inside the container
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "ScoreSeer.Api.dll"]