import React from 'react';
import { fetchPublishers } from '../util/publishers_api_util';

class Publishers extends React.Component {
  constructor(props) {
    super(props);
    this.state = {info: [], publishers: []};
    if (!localStorage.getItem('publishers')) {
      localStorage.setItem('publishers', "");
    }
  }

  componentDidMount() {

    let publishers = localStorage.getItem('publishers');
    if (publishers.length < 1) {
      publishers = [];
    } else {
      publishers = publishers.split(",");
    }

    let getDataFromLS = new Promise((resolve, reject) => {
      resolve(this.setState({['publishers']: publishers})
      );
    });

    if (publishers.length > 0) {
      getDataFromLS.then(() => {
        if (this.state.publishers.length > 0) {
          this.fetchPublishersInfo();
          this.updateSelectedClass();
        }
      });
    }
  }

  updateSelectedClass() {
    let selectedEl;
    let id;
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

  findInfoIdx(publisherName) {
    publisherName = publisherName.replace("_", " ");
    for (let i = 0; i < this.state.info.length; i++) {
      if (this.state.info[i].name === publisherName) {
        return i;
      }
    }
  }

  updatePublishers(publisher) {
    return e => {
      let newPublState = this.state.publishers;
      let newInfoState = this.state.info;
      if (this.state.publishers.includes(publisher)) {
        let publIdx = this.state.publishers.indexOf(publisher);
        let infoIdx = this.findInfoIdx(publisher);
        newPublState.splice(publIdx,1);
        newInfoState.splice(infoIdx, 1);
        e.currentTarget.classList.remove('selected');
        this.setState({['info']: newInfoState,
                       ['publishers']: newPublState});
      } else {
        newPublState.push(publisher);
        e.currentTarget.classList.add('selected');
        if (this.state.publishers.length > 0) {
          this.fetchPublishersInfo();
          this.setState({['publishers']: newPublState});
        }
      }
      this.updateLocalStorage(publisher);
    };
  }

  validateData(publisher) {
    let launchYear = publisher.launch_date.split(",")[0];
    let creators;
    let editors;
    let owners;
    let launchYearText;
    let website;
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
    if (publisher.website.includes("http")) {
      website = publisher.website;
    } else {
      website = `https://${publisher.website}`;
    }

    return {
      creators: creators,
      editors: editors,
      owners: owners,
      launchYearText: launchYearText,
      website: website
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
            <li>Website: <a href={validatedData.website}>
              {publisher.website}</a>
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
        <div className='header-container'>
          <div className="logo-container"></div>
          <h1>Select Publisher</h1>
        </div>
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
          <div className='header'>Eargo Mentions</div>
          <div>{publishers}</div>
        </div>
      </div>
    );
  }
}

export default Publishers;
