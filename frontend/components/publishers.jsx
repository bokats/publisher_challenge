import React from 'react';
import fetchPublishers from '../util/publishers_api_util';

class Publishers extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      fetchPublishers().then(res => console.log(res))
    );
  }
}

export default Publishers;
