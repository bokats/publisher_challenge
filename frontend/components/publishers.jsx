import React from 'react';
import { fetchPublishers } from '../util/publishers_api_util';

class Publishers extends React.Component {
  constructor(props) {
    super(props);
    this.state = {info: []};
    this.publishers = [];
  }

  componentDidMount() {
    if (localStorage.getItem('publishers')) {
      this.publishers = localStorage.getItem('publishers').split(",");
    }
    if (this.publishers.length > 0) {
      this.fetchPublishersInfo();
    }
  }

  fetchPublishersInfo() {
    fetchPublishers(this.publishers).then(res =>
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
        debugger;
      }
    } else {
      newState = `${publisher}`;
    }
    localStorage.setItem('publishers', newState);
  }

  updatePublishers(publisher) {
    return e => {
      if (this.publishers.includes(publisher)) {
        let idx = this.publishers.indexOf(publisher);

        this.publishers.splice(idx,1);

        e.currentTarget.classList.remove('selected');
      } else {
        this.publishers.push(publisher);
        e.currentTarget.classList.add('selected');
      }
      this.updateLocalStorage(publisher);
      if (this.publishers.length > 0) {
        this.fetchPublishersInfo();
      }
    };
  }

  render() {
    let result = "Nothing";
    if (this.state.info.length > 0) {
      result = this.state.info.map(publisher => {
        return (
          <div key={publisher.name}>
            <p>{publisher.name}</p>
            <p>{publisher.logo}</p>
            <p>{publisher.type}</p>
            <p>{publisher.website}</p>
            <p>{publisher.launch_date}</p>
            <p>{publisher.editor}</p>
            <p>{publisher.owner}</p>
            <p>{publisher.creator}</p>
          </div>
        );
      });
    }

    console.log(result);
    return (
      <div>
        <div>
          <div className='select_button'
            onClick={this.updatePublishers('GeekWire')}>
            GeekWire</div>
          <div className='select_button'
            onClick={this.updatePublishers('Gizmodo')}>
            Gizmodo</div>
          <div className='select_button'
            onClick={this.updatePublishers('PC_Magazine')}>
            PC Magazine</div>
          <div className='select_button'
            onClick={this.updatePublishers('Popular_Science')}>
            Popular Science</div>
          <div className='select_button'
            onClick={this.updatePublishers('TechCrunch')}>
            TechCrunch</div>
          <div className='select_button'
            onClick={this.updatePublishers('The_Verge')}>
            The Verge</div>
        </div>
        <div>{result}</div>
      </div>
    );
  }
}

export default Publishers;
