# Open-listings

**Open-listings is a listings' website, particularly, similar to the open-listings we see on news-papers. Let's bring the same idea to the web; This time offering rich input forms, interactive UI, an interactive Map all presented to user with multiple languages and most importantly respecting users privacy.**  

<br>
<img src="./../.github/logo.svg" alt="Open-listings logo" />
<br>
<br>

> Open-Listings is not production ready ! There are many bugs. I've built it in a mindset like make the whole thing happen quickly !

*Open-listings* as a listing web-app is unique in a way and this is why:
  - It runs very fast,
  - It offers multiple sections (based on your target users),
  - It supports tags (like hundreds),
  - Geo-locations (up to thousands),
  - Open possibilities for choices of geolocation to be targeted (country, states),
  - Multiple human languages for the web-app and the posted content.  
  - All are supported in all aspects (UI, back-end, DB, choice of deployment and configuration).


🧰 Tech stack
---
[<img src="https://github.com/devicons/devicon/blob/master/icons/javascript/javascript-original.svg" alt="JavaScript logo" width="50" height="50" />](https://www.javascript.com/) 
[<img src="https://github.com/devicons/devicon/blob/master/icons/bootstrap/bootstrap-original.svg" alt="Bootstrap logo" width="50" height="50" />](https://getbootstrap.com/docs/5.0/)
[<img src="https://github.com/devicons/devicon/blob/master/icons/nodejs/nodejs-original.svg" alt="NodeJS logo" width="50" height="50" />](https://nodejs.org/)
[<img src="https://github.com/fastify/graphics/raw/HEAD/fastify-landscape-outlined.svg" alt="Fastify logo" width="50" height="50" />](https://fastify.io/)
[<img src="https://github.com/devicons/devicon/blob/master/icons/mongodb/mongodb-original.svg" alt="MongoDB logo" width="50" height="50" />](https://docs.mongodb.com/drivers/node/current/)

<p align="center"><img src="./stack.png" width="50%"/></p>

## Functionalities

- Navigation: view a listing, view some tag, view some region, change language, ...
- Search: performant advanced search using text based on indexes, intelligent autocompletion based on a whole scan of DB, geo-search (by radius), front-end search.
- Add a listing in a section, Send a comment to author.
- Basic admin moderation of listings (approve or delete a new listing), check anonymous visitors countries by number.
- Multi-language support on back and front end.
- Maps integration is quite good, you need to check that by yourself !
- A pretty rich UI using dozens of lightweight JS browser libraries (all are very carefully picked !).

## User interface

Listing page             |  Homepage             |  Admin dashboard
:-------------------------:|:-------------------------:|:-------------------------:
![](./Screenshot%20-%20section%20-%20listing.png)  |  ![](./Screenshot%20homepage.png)  |  ![](./Screenshot%20admin.png)


## Deployment

### A must configuration

`.env` files hold secret keys and configurations which you want to hide.  
All other configurations should live in `/config/{NODE_env}.json` file.

-  Create environment files
`touch /.env && /client/.env`
-  Fulfill environment variables on server (note that `api` is meant for easy deployment on your machine without a UI. At this stage, I'm focusing on bugs so I made this distinction.  

You can run it with `NODE_ENV=production` to have UI.

```Shell
NODE_ENV=api/production
GCLOUD_STORAGE_BUCKET=NameOfBucket
JWT_SECRET=Just@Passw0rd
COOKIE_NAME=Just@Name
SECRET_PATH=Just@Passw0rd
PASSWORD=Just@Passw0rd
ADMIN_PASS=PASSWORD
ADMIN_EMAIL=moderatorEmail
ADMIN_EMAIL2=moderatorEmail
SENDGRID_API_KEY=
APP_NAME=OLisings
DEFAULT_LANG=en-US/fr/ar/..
IS_REDIS_CACHE=true # Consider turning to true, to use cached listings (next version)
IS_MONGO_DB=true # Whether to use MongoDB server or just NeDB (for development purposes!) think of NeDB as Sqlite with a MongoDB API !
``` 

NeDB support for development purposes is work in progress, and contribution is welcome :)
   
Also client keys:
```Shell
GOOGLE_FONT_API=
MAPBOX_GEO_SEARCH=
```

### Install and run Docker compose
- This has been tested only on Linux
- Make sur there are no running MongoDB and Redis instances, ports `['6379', '27017', '8090', '2019', '3000', '9000']` are free. Better to not have them installed at all on host machine
- Just install Docker and then run `./deploy.sh`

### Install and run the web-app
- Install Node the run `npm install` on root `./` folder and on `./client` folder
-  Prepare databases  
   - Redis database must be up  
   - MongoDB must be up with the following dbs and collections  
`DBs: {listings_db} & Collections: {listing, words, comment, users, userstemp, visitors-default-current, visitors-default}`
- Fulfill Google Cloud credentials (for storage) (optional for api env)
`./credentials/service-account.json` 
- Change environment files accordingly
- Verify configuration on your environments as you want here `/config`
- Prepare some data-sets: `npm run download:assets`
- Build the whole project: `npm run build`

> The app is targeting Linux mainly, for me it runs without Docker images on Windows Server as well (with Windows installation of MongoDB/Redis). If installation didn't go as expected; Please open an issue with steps of installation so we make this smoother.

### Note

The app bootstraps for some country as an example, with a simple tweak, you could bootstrap the app on another location with a different map.
Just check `./.env` and `client/.env` for `APP_NAME`, `DEFAULT_LAT` etc.

With a different geoJSON data format, you might need to change encoders in both files `/data/geo/geoJSONEncoder.js` and `/client/data/geo/geoJSONEncoder.js`.

## Front-end libraries
Open-listings UI relies heavily on third parties. The following open source solutions have these traits in common: they are bright, lightweight, well maintained and popular. they are simply the best I could find. So big thanks to their creators.      
By this table I'm giving reference to their collaborators and to keep track on their updates.  

|lib|link|installed version|latest version|
|-----------------------------------|-------------------------------------------------------------------|-------------|-------|
|@tarekraafat/autocomplete.js       |https://github.com/TarekRaafat/autoComplete.js             |^10.2.7      |10.2.7 |
|@yaireo/tagify                     |https://github.com/yairEO/tagify                           |^4.17.7      |4.17.8 |
|avatar-initials                    |https://github.com/MatthewCallis/avatar                    |^6.0.0       |6.0.0  |
|bootstrap                          |https://github.com/twbs/bootstrap                          |^5.3.0-alpha1|5.3.0  |
|clipboard                          |https://github.com/zenorocha/clipboard.js                  |^2.0.11      |2.0.11 |
|detect-inapp                       |https://github.com/f2etw/detect-inapp                    |^1.4.0       |1.4.0  |
|font-picker                        |https://github.com/samuelmeuli/font-picker                     |^3.5.1       |3.5.1  |
|holmes.js                          |https://github.com/Haroenv/holmes                          |^1.17.3      |1.17.3 |
|htmx.org                           |https://github.com/bigskysoftware/htmx                     |^1.8.5       |1.9.2  |
|i18next                            |https://github.com/i18next/i18next                         |^22.4.10     |22.5.1 |
|leaflet & leaflet.markercluster                            |https://github.com/Leaflet/Leaflet                                |^1.9.3       |1.9.4  |
|leaflet-geosearch                  |https://github.com/smeijer/leaflet-geosearch               |^3.7.0       |3.8.0  |
|mixitup                            |https://github.com/patrickkunka/mixitup/                           |^3.3.1       |3.3.1  |
|notyf                              |https://github.com/caroso1222/notyf                        |^3.10.0      |3.10.0 |
|pell                               |https://github.com/jaredreich/pell                         |^1.0.6       |1.0.6  |
|screenfull                         |https://github.com/sindresorhus/screenfull                 |^6.0.2       |6.0.2  |
|simple-lightbox                    |https://github.com/dbrekalo/simpleLightbox                 |^2.1.0       |2.1.0  |
|svg-injector                       |https://github.com/iconic/SVGInjector                              |^1.1.3       |1.1.3  |
|tippy.js                           |https://github.com/atomiks/tippyjs                         |^6.3.7       |6.3.7  |
|vanilla-picker                     |https://github.com/Sphinxxxx/vanilla-picker                |^2.12.1      |2.12.1 |

----

### Pull requests

- Merging the same code with different indentations is hell, so it is important to keep one coding style between forks. I suggest to install [VSCode ESlint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) (Prettier also) that connects automatically with `./eslintrc.js` and `./client/./eslintrc.js`. 
    - "dbaeumer.vscode-eslint"
    - "esbenp.prettier-vscode"

---


Algebra-insights Inc.  
 France 2023

## License
  View [license](/LICENSE)  
  If
 you have any questions about our projects you can email [yanna92yar@gmail.com](mailto:yanna92yar@gmail.com)
