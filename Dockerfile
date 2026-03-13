# Stage 1: Build React frontend
FROM node:20 AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Stage 2: Build .NET backend
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS server-build
WORKDIR /app
COPY server/ ./server/
# This builds the backend and prepares it for production
RUN dotnet publish server/server.csproj -c Release -o /app/publish


# Stage 3: Final production image
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
# Copy the published backend
COPY --from=server-build /app/publish .
# Copy the built React files to the backend's wwwroot folder
COPY --from=client-build /app/client/dist ./wwwroot

EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "server.dll"]
