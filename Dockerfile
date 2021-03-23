### STAGE 1: Build ###


# base image
FROM node:14.15.4-alpine as build

# set working directory
WORKDIR /app

# needs to be copied to work dir to be able to run npm install
COPY ["package.json", "package-lock.json", "./"]

# install and cache app dependencies
RUN npm ci

## copy code to workdir
COPY . .

# generate build
# override default ANGULAR_CONFIG with docker build --build-arg ANGULAR_CONFIG=production .
ARG ANGULAR_CONFIG=local

RUN ./node_modules/.bin/ng build --output-path=dist --configuration=${ANGULAR_CONFIG}

## remove packages of devDependencies
RUN npm prune --production


### STAGE 2: Run ###

# base image
FROM nginx:1.19.6-alpine

## Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# copy artifact build from the 'build environment'
COPY --from=build /app/dist /usr/share/nginx/html

# expose port 80
EXPOSE 80

# run nginx
CMD ["nginx", "-g", "daemon off;"]
