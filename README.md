# Open-listings

**Open-listings is a listings' website, particularly, similar to the open-listings we see on news-papers. Let's bring the same idea to the web; This time offering rich input forms, interactive UI, an interactive Map all presented to user with multiple languages and most importantly respecting users privacy.**  

<br>
<img src="logo.svg" alt="Open-listings logo" />
<br>
<br>

> Open-Listings is not production ready ! There are many bugs. I've built it in a mindset like make the whole thing happen quickly ! There is dirty code as well !
> Do not blame me with the many many bugs

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

🧰 Front-end JS/CSS
---
[<img src="https://raw.githubusercontent.com/jaredreich/pell/master/images/logo.png" alt="Pell logo" width="50" height="50" />](https://github.com/jaredreich/pell)
[<img src="https://raw.githubusercontent.com/yairEO/tagify/master/docs/readme-header.svg" alt="Tagify" width="50" height="50" />](https://github.com/yairEO/tagify)
[<img src="https://haroen.me/holmes/images/holmes_logo-hover.svg" alt="Holmes" width="50" height="50" />](https://github.com/Haroenv/holmes)
[<img src="https://cdn.worldvectorlogo.com/logos/leaflet-1.svg" alt="Leaflet logo" width="100" height="50" />](https://leafletjs.com/)
[<img src="https://camo.githubusercontent.com/2ad966e7273e5fa36e98a63f6ad2c99e023ac67f0bef3bb8ff3a308a12d219aa/68747470733a2f2f67626c6f627363646e2e676974626f6f6b2e636f6d2f7370616365732532462d4c39695336576d3268796e53354839476a376a2532466176617461722e706e673f616c743d6d65646961" alt="I18n
" width="50" height="50" />](https://github.com/danabr/jsI18n)
<p>... and many others</p>


## Functionalities

- Navigation: view a listing, view some tag, view some region, change language, ...
- Search: performant advanced search using text based on indexes, intelligent autocompletion based on a whole scan of DB, geo-search (by radius), front-end search.
- Add a listing in a section, Send a comment to author.
- Basic admin moderation of listings (approve or delete a new listing), check anonymous visitors countries by number.
- Multi-language support on back and front end.
- Maps integration is quite good, you need to check that by yourself !
- A pretty rich UI using dozens of lightweight JS browser libraries (all are very carefully picked !).


## Deployment

### A must configuration

`.env` files hold secret keys and configurations which you want to hide.  
All other configurations should live in `/config/{NODE_env}.json` file.

-  Create environment files
`touch /.env && /client/.env`
-  Fulfill environment variables on server (note that `api` is meant for easy deployment on your machine without a UI. At this stage, I'm focusing on bugs so I made this distinction.  

You can run it with `NODE_ENV=production` to have UI.

   - NODE_ENV=api/production
   - GCLOUD_STORAGE_BUCKET=NameOfBucket
   - JWT_SECRET=Just@Passw0rd
   - COOKIE_NAME=Just@Name
   - SECRET_PATH=Just@Passw0rd
   - PASSWORD=Just@Passw0rd
   - ADMIN_PASS=PASSWORD
   - ADMIN_EMAIL=moderatorEmail
   - ADMIN_EMAIL2=moderatorEmail
   - SENDGRID_API_KEY=
   - APP_NAME=OLisings
   - DEFAULT_LANG=en-US/fr/ar/..
   
Also client keys:
   - GOOGLE_FONT_API=
   - MAPBOX_GEO_SEARCH=

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