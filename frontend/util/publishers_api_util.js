export const fetchPublishers = () => {
  return $.ajax ({
    method: 'GET',
    url: 'api/publishers'
  });
};
