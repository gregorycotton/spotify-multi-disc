const express = require('express');
const SpotifyWebApi = require('spotify-web-api-node');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(express.static('public'));
app.use(cors());

const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: process.env.SPOTIFY_REDIRECT_URI,
});

app.get('/login', (req, res) => {
    const scopes = ['user-read-private', 'user-read-email', 'user-library-read', 'streaming'];
    const authorizeURL = spotifyApi.createAuthorizeURL(scopes);
    res.redirect(authorizeURL);
});

app.get('/callback', async (req, res) => {
    const code = req.query.code || null;
    try {
        const data = await spotifyApi.authorizationCodeGrant(code);
        const { access_token, refresh_token, expires_in } = data.body;

        spotifyApi.setAccessToken(access_token);
        spotifyApi.setRefreshToken(refresh_token);

        res.redirect(`/index.html?access_token=${access_token}`);
    } catch (error) {
        console.error('Error during Spotify authorization', error);
        res.send('Error during authentication');
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});