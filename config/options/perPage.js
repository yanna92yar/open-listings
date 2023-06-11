const defaults = {
    api: 9,
    localhost: 12,
    production: 12,
}[process.env.NODE_ENV]

export default (context) => {
    return (
        {
            gwoogl: 12,
            geolocation: 12,
            markets: 12,
            skills: 12,
            blogs: 12,
            events: 12,
            hobbies: 12,
        }[context] || defaults
    )
}
