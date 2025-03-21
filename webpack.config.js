
const webpack = require('webpack');
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');


const title = "Basic Three.js Starter";
const short_title = title;
const description = "A basic Three.js starter template.";
const locale = "en-au";
const color = "#000";
const author = "Henry Egloff";
const author_url = "https://henryegloff.com";
const twitter_handle = "@henryegloff";


const config = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'script.js',
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { 
          from: 'src/index.html',
          transform(content) {
            return content.toString()
            .replace(/{title}/g, title)
            .replace(/{description}/g, description)
            .replace(/{lang}/g, locale)
            .replace(/{color}/g, color)
            .replace(/{twitter_handle}/g, twitter_handle)
            .replace(/{author}/g, author)
            .replace(/{author_url}/g, author_url)
          },    
        },
        { from: 'src/_icons/', to:'_icons' },
        { from: 'src/textures/', to:'textures' },
        { from: 'src/models/', to:'models' },
      ],
    })
  ],
  mode: 'development'
};

module.exports = config;

