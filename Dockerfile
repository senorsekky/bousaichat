FROM node:20.2.0-alpine
    
WORKDIR /usr/src/app

COPY . /usr/src/app/

ENV NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyAu7ArrZd2Y9Wzdn3VcUy0RlE-kKYyIeNU

RUN npm install --production

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]