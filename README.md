## What this is

This will automatically organize your thingiverse downloads.

It will make a folder with the name of the thing, create a PDF of the page, save
a clickable URL shortcut and download all the stl files to your choosen sort
folder for easy archiving.

## How to use

1. Install project dependencies. `yarn install` or `npm install`

2. Edit config file:

```json
{
  "port": 8585,
  "saveFolderPath": "D:\\Downloads\\_testing" # Replace this path to where you want to have the files downloaded at. A single \ needs to be replaced with \\ on Windows.
}
```

3. Compile and run. `tsc` then `node dist\index.js`

4. Create a new toolbar bookmark. Add the following code to the URL text box.
   Making sure to replace `http://localhost:8585` with the url/port to your
   instance. If running this program locally this does NOT need to be changed.

> `javascript:(function(){var url=document.URL;window.location.replace(`http://localhost:8585/download?targetURL=${url}`)})()`

5. Navigate to the thingiverse thing page and click the bookmark. The thing
   files will automatically be downloaded and sorted to the specified directory
   in the config.

6. Idk maybe buy me a coffee lol ;)

## Todo

1. Add images for better clarity
