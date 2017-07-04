## Publisher Challenge

The program in this repo uses Wikipedia API to fetch publishers that have had mentions of Eargo before and render specific information related to the publishers on the page.

### Set up and execution instructions
The program is written in Ruby on Rails and React. To run the program:
1. Unzip the file.
2. Run `bundle install`
3. Run `npm install`.
4. Open two new terminals in the same directory and run `webpack --watch` in one and `rails server` in the other.
5. Go to `http://localhost:3000`

### Program structure
The general structure of the programs is it fetches information about 6 specific publishers in the backend through the Wikipedia API, sends it to the frontend, which then styles and puts the information on the page. Because the API response from is scrambled data, there is fair bit of parsing on the backend to return a cleaner JSON response to frontend. The backend has to make an additional call to the API to grab the specific logo path of the publishers. The app does not use a database and instead takes advantage of local storage because of the simplicity of the data flow.

The user has the option to select and unselect any of the given 6 publishers. Once clicked, the data will flow dynamically and the page will be updated.

On the frontend, there is only one path (the index) because of the simplicity of the application. The publishers being shown on the page are also saved in local storage so that the data is persistent on refresh.
