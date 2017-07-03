json.array! @publishers.each do |publisher|
  json.name publisher['name']
  json.logo publisher['logo']
  json.type publisher['type']
  json.website publisher['website']
  json.launch_date publisher['launch_date']
  json.editor publisher['editor']
  json.owner publisher['owner']
  json.creator publisher['creator']
end
