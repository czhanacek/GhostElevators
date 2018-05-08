FROM mhart/alpine-node:6 as buildstage
RUN apk add --update git
RUN git clone https://github.com/czhanacek/GhostElevators
WORKDIR GhostElevators
RUN npm install
RUN npm run build

FROM nginx as runstage
COPY --from=buildstage GhostElevators/ /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]


