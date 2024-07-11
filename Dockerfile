# use an official Node.js runtime as a parent image
FROM node:14

# set the working directory in the container
WORKDIR /usr/src/app

# copy package.json and package-lock.json
COPY package*.json ./

# install dependencies
RUN npm install

# copy the rest of the application files
COPY . .

# build the typescript code
RUN npm run build

# expose the port the app runs on
EXPOSE 3000

# command to run the application
CMD ["npm", "run", "dev"]
