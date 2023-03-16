<p align="center">
  <a href="https://cdn.itwcreativeworks.com/assets/chatsy/images/logo/chatsy-brandmark-black-x.svg">
    <img src="https://cdn.itwcreativeworks.com/assets/chatsy/images/logo/chatsy-brandmark-black-x.svg" width="100px">
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/github/package-json/v/chatsy-ai/chatsy.svg">
  <br>
  <img src="https://img.shields.io/librariesio/release/npm/chatsy.svg">
  <img src="https://img.shields.io/bundlephobia/min/chatsy.svg">
  <img src="https://img.shields.io/codeclimate/maintainability-percentage/chatsy-ai/chatsy.svg">
  <img src="https://img.shields.io/npm/dm/chatsy.svg">
  <img src="https://img.shields.io/node/v/chatsy.svg">
  <img src="https://img.shields.io/website/https/chatsy.ai.svg">
  <img src="https://img.shields.io/github/license/chatsy-ai/chatsy.svg">
  <img src="https://img.shields.io/github/contributors/chatsy-ai/chatsy.svg">
  <img src="https://img.shields.io/github/last-commit/chatsy-ai/chatsy.svg">
  <br>
  <br>
  <a href="https://chatsy.ai">Site</a> | <a href="https://www.npmjs.com/package/chatsy">NPM Module</a> | <a href="https://github.com/chatsy-ai/chatsy">GitHub Repo</a>
  <br>
  <br>
  <strong>chatsy</strong> is the official npm module of <a href="https://chatsy.ai">Chatsy</a>, a free no-code conversational AI chatbot. Automate customer support and increase sales in 5 minutes with the Chatsy 24/7 chatbot—no coding required!
</p>

## Chatsy Works in Node AND browser environments
Yes, this module works in both Node and browser environments, including compatibility with [Webpack](https://www.npmjs.com/package/webpack) and [Browserify](https://www.npmjs.com/package/browserify)!

## Features
* Getting proxy lists

### Getting an API key
You can use so much of `chatsy` for free, but if you want to do some advanced stuff, you'll need an API key. You can get one by [signing up for a Chatsy account](https://chatsy.ai/authentication/signup).

## Install Chatsy
### Install via npm
Install with npm if you plan to use `chatsy` in a Node project or in the browser.
```shell
npm install chatsy
```
If you plan to use `chatsy` in a browser environment, you will probably need to use [Webpack](https://www.npmjs.com/package/webpack), [Browserify](https://www.npmjs.com/package/browserify), or a similar service to compile it.

```js
const chatsy = new (require('chatsy'))({
  // Not required, but having one removes limits (get your key at https://chatsy.ai).
  apiKey: 'api_test_key'
});
```

### Install via CDN
Install with CDN if you plan to use Chatsy only in a browser environment.
```html
<script data-account-id="yourAccountId" data-chat-id="yourChatId" src="https://app.chatsy.ai/resources/script.js"></script>
<script type="text/javascript">
  chatsy.open();
</script>
```

## Using Chatsy
After you have followed the install step, you can start using `chatsy`. 

For a more in-depth documentation of this library and the Chatsy service, please visit the official Chatsy website.

## What Can Chatsy do?
Chatsy is a a [free no-code conversational AI chatbot](https://chatsy.ai). Automate customer support and increase sales in 5 minutes with the Chatsy 24/7 chatbot—no coding required!

## Final Words
If you are still having difficulty, we would love for you to post
a question to [the Chatsy issues page](https://github.com/chatsy-ai/chatsy/issues). It is much easier to answer questions that include your code and relevant files! So if you can provide them, we'd be extremely grateful (and more likely to help you find the answer!)

## Projects Using this Library
* coming soon!

Ask us to have your project listed! :)
