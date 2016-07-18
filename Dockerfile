
# Simple NodeJS container
FROM node:argon



# Workign directory where the code exists
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Copy source from host to docker container
COPY . /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install
#RUN npm install node-sparky
#RUN npm install sparkbot-starterkit

# Adding permission to access .shipped folder
RUN chmod a+x .shipped/build .shipped/run .shipped/test

# Provide your build/run commands
RUN [".shipped/build"]
CMD .shipped/run

# Port number to expose from docker container to host server
EXPOSE 80
