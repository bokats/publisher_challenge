require 'byebug'

class Api::PublishersController < ApplicationController
  def index
    # publishers = params['publishers'].join("|")
    publishers = "GeekWire|TechCrunch"
    url = "https://en.wikipedia.org/w/api.php?action=query&titles=#{publishers}\
    &prop=revisions&rvprop=content&format=json"

    response = HTTParty.get(url)

    @items = ['logo', 'image_file', 'type', 'editor', 'owner', 'url', 'website',
              'launch date', 'launch_date', 'firstdate', 'author', 'founded',
              'category', 'publisher', 'published']

    @publishers = find_values(response.parsed_response)
    p @publishers
  end

  private

  def find_values(response)
    final_result = []

    pages = response['query']['pages'].keys

    pages.each do |page|
      @values = {}
      info_array = response['query']['pages'][page]['revisions'][0]\
      ['*'].split("|")
      @values['name'] = response['query']['pages'][page]['title']
      idx = 0
      while @values.keys.length < 8 && idx < 40
        @items.each do |item|
          if info_array[idx][0...item.length + 1].include?(item)
            case item
            when 'logo', 'image_file'
              determine_logo(info_array, idx, item)
            when 'type', 'category'
              determine_type(info_array, idx)
            when 'url', 'website'
              determine_website(info_array, idx)
            when 'launch_date', "launch date", "firstdate", "founded"
              determine_launch_date(info_array, idx)
            when 'owner', 'publisher'
              @values['owner'] = parse_value(info_array[idx], item)
            when 'published'
              determine_publisher(info_array[idx])
            when 'author'
              determine_creator(info_array, idx)
            when 'editor'
              @values[item] = parse_value(info_array[idx], item)
            end
          end
        end
        idx += 1
      end
      check_for_missing
      final_result << @values
    end
    final_result
  end

  def check_for_missing
    if @values.key?('creator')
      @values['owner'] = @values['creator'] if !@values.key?('owner')
      @values['editor'] = @values['creator'] if !@values.key?('editor')
    end
  end

  def determine_creator(info_array, idx)
    next_line = info_array[idx + 1].split("=")
    if next_line[0] != 'page' && next_line[0] != 'title'
      @values['creator'] = parse_value(info_array[idx], 'creator')
    end
  end

  def determine_publisher(string)
    parsed_result = string.gsub("\n", "")
    parsed_result.delete!("[]}.")
    parsed_result = parsed_result.split(" ")
    parsed_result = parsed_result[2...4].join(" ")
    @values['owner'] = parsed_result
  end

  def determine_logo(info_array, idx, item)
    if !@values.key?('logo') && (info_array[idx].include?('.png') ||
      info_array[idx].include?('.svg'))
      image_dir = parse_value(info_array[idx], item)
      url = "https://en.wikipedia.org/w/api.php?action=query&titles=\
      #{image_dir}&prop=imageinfo&iiprop=url&format=json"
      find_image_url(url)
    end
  end

  def find_image_url(url)
    response = HTTParty.get(url)
    page = response.parsed_response['query']['pages'].keys[0]
    @values['logo'] = response.parsed_response['query']['pages'][page]\
    ['imageinfo'][0]['url']
  end

  def determine_type(info_array, idx)
    if !info_array[idx + 1].include?("=")
      has_equal_sign = false
      sub_idx = idx + 1
    else
      sub_idx = idx
      has_equal_sign = true
    end
    @values['type'] = parse_value(info_array[sub_idx], 'type', has_equal_sign)
  end

  def determine_website(info_array, idx)
    if info_array[idx].include?("URL")
      @values['website'] = parse_value(info_array[idx + 1], 'url', false)
    else
      equals_idx = info_array[idx].index("=")
      if info_array[idx][equals_idx + 1] == "["
        @values['website'] = parse_value(info_array[idx], 'url')
      end
    end
  end

  def determine_launch_date(info_array, idx)
    idx += 1
    while info_array[idx].to_i == 0
      idx += 1
    end
    date = ''
    count = 0
    while count < 3
      el = info_array[idx + count].split("}")[0]
      if el[0].to_i > 0 || el[0] == "0"
        if count == 0
          date += el
        else
          date += ",#{el}"
        end
      end
      count += 1
    end
    @values['launch_date'] = date
  end

  def parse_value(string, type, has_equal_sign = true)
    parsed_result = string.gsub("\n", "")
    parsed_result.delete!("[]}")
    if has_equal_sign
      parsed_result = parsed_result.split("=")[1]
      parsed_result = parsed_result[1..-1] if parsed_result[0] == " "

      case type
      when 'logo', 'image_file'
        parsed_result.gsub!(" ", "_")
        if type == 'image_file'
          parsed_result = "File:#{parsed_result}"
        end
      when 'owner'
        parsed_result = parsed_result.split("<br>")
        parsed_result = parsed_result.join(",")
      when 'url'
        parsed_result = parsed_result.split(" ")[0]
      when 'creator'
        parsed_result = parsed_result.split("<br />")
        parsed_result = parsed_result.join(",")
      end
    end
    parsed_result
  end

end
