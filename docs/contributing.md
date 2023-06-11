## Contributing

**Contribution is VERY WELCOME, I already thank you in advance.**  We're always looking to improve this project, open source contribution is encouraged so long as they adhere to the following guidelines. The first version of this project was written by a single person with the mindset of being productive; We admit that the structure and code at this stage is not the easiest to comprehend. In addition, the developer himself did not adhere to conventional approaches as we see in most web projects.  

It is to note that the whole project is written in JavaScript, we believe we don't need TypeScript until proven wrong. We don't a reactive library for the front-end neither. 

### Pull requests  

- Our focus at this stage is on resolving bugs and enhancing performance rather than adding new functionalities.

- As a contributor, never bypass Husky pre commit hooks, it is not a TypeScript project but we assure some level of typing against errors using JSDoc. After several attempts or when really needed add a `@ts-ignore` on that line only.

- *keep it stupid, simple* 

- We rely on dozens of open sources projects particularly for front-end particularly. These are lightweight, minimal and safe libraries. Some examples are: 

  * pell: 📝 the simplest and smallest WYSIWYG text editor for web, with no dependencies [repo](https://github.com/jaredreich/pell)
  * tagify: 🔖 lightweight, efficient Tags input component in Vanilla JS / React / Angular / Vue  [repo](https://github.com/yairEO/tagify)
  * notyf: 👻 A minimalistic, responsive, vanilla JavaScript library to show toast notifications [repo](https://github.com/caroso1222/notyf)
  * holmes: Fast and easy searching inside a page [repo](https://github.com/Haroenv/holmes) It uses microlight also.
  * auto-complete:  An extremely lightweight and powerful vanilla JavaScript completion suggester. [repo](https://github.com/Pixabay/JavaScript-autoComplete)
  * jsi18n: Simple client side internationalization with javascript. [repo](https://github.com/danabr/jsI18n) 
  * avatar: Library for showing Gravatars or generating user avatars. [repo](https://github.com/MatthewCallis/avatar) 
  * FontPicker: Font selector component for Google Fonts . [repo](https://github.com/samuelmeuli/font-picker)

    This raises multiple challenges mainly for upgrading and actively maintained from their authors. We would like to rely always on the latest versions, but we would change one library by another if the project seems inactive or very old (like not supporting modules or so).
    Leaflet particularly is the most important in this regard.

    We suggest to install [ndm](https://720kb.github.io/ndm/) and add two projects `./` and `./client/` to keep an eye on last versions and what to expect.