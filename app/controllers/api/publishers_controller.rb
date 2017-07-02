require 'byebug'

class Api::PublishersController < ApplicationController
  def index
    publishers = 'Popular_Science|PC_Magazine|TechCrunch|Gizmodo|The_Verge|GeekWire'
    # publishers = 'Popular_Science'
    url = "https://en.wikipedia.org/w/api.php?action=query&titles=#{publishers}\
    &prop=revisions&rvprop=content&format=json"

    response = HTTParty.get(url)

    @items = ['logo', 'image_file', 'type', 'editor', 'owner', 'url', 'website',
    'launch date', 'launch_date', 'firstdate', 'author', 'founded']

    @result = find_values(response.parsed_response)
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
            when 'type'
              determine_type(info_array, idx)
            when 'url', 'website'
              determine_website(info_array, idx)
            when 'launch_date', "launch date", "firstdate", "founded"
              determine_launch_date(info_array, idx)
            when 'editor', 'owner', 'author'
              @values[item] = parse_value(info_array[idx], item)
            end
          end
        end
        idx += 1
      end
      final_result << @values
    end
    final_result
  end

  def determine_logo(info_array, idx, item)
    if !@values.key?('logo') && (info_array[idx].include?('.png') ||
      info_array[idx].include?('.svg'))
      image_dir = parse_value(info_array[idx], item)
      name = @values['name'].gsub(" ", "_")
      @values['logo'] =
        "https://en.wikipedia.org/wiki/#{name}#/media/#{image_dir}"
    end
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
          date += ", #{el}"
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
      when 'url'
        parsed_result = parsed_result.split(" ")[0]
      when 'author'
        parsed_result = parsed_result.split("<br />")
        if parsed_result.length > 1
          parsed_result[1] = parsed_result[1].split("<")[0]
        end
      end
    end
    parsed_result
  end
end
