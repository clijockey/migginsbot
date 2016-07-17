FROM node:argon

# Port number to expose from docker container to host server
EXPOSE 8080

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install
RUN npm install node-sparky
RUN npm install sparkbot-starterkit

# Bundle app source
COPY . /usr/src/app

#Adding permission to access .shipped folder
RUN chmod a+x .shipped/build .shipped/run .shipped/test

#provide your build/run commands
RUN [".shipped/build"]
CMD .shipped/run
