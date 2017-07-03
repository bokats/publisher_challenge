export const fetchPublishers = (publishers) => {
  return $.ajax ({
    method: 'GET',
    url: 'api/publishers',
    data: {publishers}
  });
};
