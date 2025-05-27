# Playlist Color

A React application that creates dynamic color gradients based on song moods. As you add songs to your playlist, the background gradient evolves, reflecting the emotional journey of your music selection.

## Features

- Dynamic background gradient that changes based on song moods
- Mood-based color selection (dark colors for sad songs, bright colors for energetic ones)
- Clean, minimal interface
- Supports up to 8 songs
- Smooth transitions and animations
- Responsive design

## How it works

1. Enter a song title in the input field
2. The app analyzes the song's mood using an external API
3. A color is assigned based on the mood (e.g., dark blue for sad songs, yellow for happy ones)
4. The background gradient updates to include the new color
5. Colors are slightly varied based on the song title to create unique gradients

## Mood-Color Mapping

- Sad songs → Dark blue
- Melancholic songs → Dark purple
- Calm songs → Teal
- Happy songs → Yellow
- Energetic songs → Red
- Pop songs → Pink
- Relaxing songs → Green
- And more...

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/delsallorenzo/colors.git
   ```

2. Install dependencies:
   ```bash
   cd colors
   npm install
   ```

3. Create a `.env` file in the root directory and add your API URL:
   ```
   REACT_APP_API_URL=your_api_url_here
   ```

4. Start the development server:
   ```bash
   npm start
   ```

## Technologies

- React
- CSS3 (with modern features like backdrop-filter)
- External mood analysis API

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
