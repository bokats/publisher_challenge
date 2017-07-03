import React from 'react';
import { fetchPublishers } from '../util/publishers_api_util';

class Publishers extends React.Component {
  constructor(props) {
    super(props);
    this.state = {info: [], publishers: []};
  }

  componentDidMount() {

    let promise = new Promise((resolve, reject) => {
      resolve(this.setState({['publishers']:
        localStorage.getItem('publishers').split(",")}));
    });

    if (localStorage.getItem('publishers')) {
      promise.then(() => {
        this.fetchPublishersInfo();
        this.updateSelectedClass();
      });
    }
  }

  updateSelectedClass() {
    let selectedEl;
    let id;
    debugger;
    for (let i = 0; i < this.state.publishers.length; i++) {
      selectedEl = document.getElementById(`${this.state.publishers[i]}`);
      selectedEl.classList.add('selected');
    }
  }

  fetchPublishersInfo() {
    fetchPublishers(this.state.publishers).then(res =>
      this.setState({['info']: res}));
  }

  updateLocalStorage(publisher) {
    let newState;
    if (localStorage.getItem('publishers')) {
      newState = localStorage.getItem('publishers');
      if (!newState.includes(publisher)) {
        newState += `,${publisher}`;
      } else {
        newState = newState.split(",");
        let idx = newState.indexOf(publisher);
        newState.splice(idx, 1);
      }
    } else {
      newState = `${publisher}`;
    }
    localStorage.setItem('publishers', newState);
  }

  updatePublishers(publisher) {
    return e => {
      let newState = this.state.publishers;
      if (this.state.publishers.includes(publisher)) {
        let idx = this.state.publishers.indexOf(publisher);
        newState.splice(idx,1);
        e.currentTarget.classList.remove('selected');
      } else {
        newState.push(publisher);
        e.currentTarget.classList.add('selected');
      }
      this.setState({['publishers']: newState});
      this.updateLocalStorage(publisher);
      if (this.state.publishers.length > 0) {
        this.fetchPublishersInfo();
      } else {
        this.setState({['info']: []});
      }
    };
  }

  validateData(publisher) {
    let launchYear = publisher.launch_date.split(",")[0];
    let creators;
    let editors;
    let owners;
    let launchYearText;
    if (publisher.creator && publisher.creator.includes(",")) {
      creators = publisher.creator.split(",").join(" and ");
    } else {
      creators = publisher.creator;
    }
    if (publisher.editor && publisher.editor.includes(",")) {
      editors = publisher.editor.split(",").join(" and ");
    } else {
      editors = publisher.editor;
    }
    if (publisher.owner) {
      owners = publisher.owner.split(",").join(" and ");
    } else {
      owners = publisher.editor;
    }
    if (creators) {
      launchYearText = `Launched in ${launchYear} by ${creators}`;
    } else {
      launchYearText = `Launched in ${launchYear}`;
    }
    return {
      creators: creators,
      editors: editors,
      owners: owners,
      launchYearText: launchYearText
    };
  }

  mapPublishersToHTML() {
    let result = this.state.info.map((publisher, idx) => {
      let imageUrl = {
        background: `url(${publisher.logo})`
      };

      let validatedData = this.validateData(publisher);

      let publisherInfo = (
        <div className='publisher-info-container'>
          <p className='name'>{publisher.name} ({publisher.type})</p>
          <ul className='publisher-list'>
            <li>{validatedData.launchYearText}</li>
            <li>Editor: {validatedData.editors}</li>
            <li>Owned by {validatedData.owners}</li>
            <li>Website: <a href={publisher.website}>{publisher.website}</a>
            </li>
          </ul>

        </div>
      );

      let publisherHTML;
      if (idx % 2 === 0) {
        publisherHTML = (
          <div key={publisher.name} className='publisher-container'>
            {publisherInfo}
            <img src={publisher.logo} className="image right-image"></img>
          </div>
        );
      } else {
        publisherHTML = (
        <div key={publisher.name} className='publisher-container'>
          <img src={publisher.logo} className="image left-image"></img>
          {publisherInfo}
        </div>
        );
      }
      return publisherHTML;
    });
    return result;
  }

  render() {
    let publishers = this.mapPublishersToHTML();

    return (
      <div>
        <div className='publisher-buttons-container'>
          <div className='select-button' id="GeekWire"
            onClick={this.updatePublishers('GeekWire')}>
            GeekWire</div>
          <div className='select-button' id="Gizmodo"
            onClick={this.updatePublishers('Gizmodo')}>
            Gizmodo</div>
          <div className='select-button' id ="PC_Magazine"
            onClick={this.updatePublishers('PC_Magazine')}>
            PC Magazine</div>
          <div className='select-button' id="Popular_Science"
            onClick={this.updatePublishers('Popular_Science')}>
            Popular Science</div>
          <div className='select-button' id="TechCrunch"
            onClick={this.updatePublishers('TechCrunch')}>
            TechCrunch</div>
          <div className='select-button' id="The_Verge"
            onClick={this.updatePublishers('The_Verge')}>
            The Verge</div>
        </div>
        <div className='publishers-index-container'>
          <div className='header'>Publisher Mentions</div>
          <div>{publishers}</div>
        </div>
      </div>
    );
  }
}

export default Publishers;
