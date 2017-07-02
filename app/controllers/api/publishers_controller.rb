require 'byebug'

class Api::PublishersController < ApplicationController
  def index
    # publishers = 'Popular_Science|PC_Magazine|TechCrunch|Gizmodo|The_Verge|GeekWire'
    publishers = 'Popular_Science'
    response = HTTParty.get("https://en.wikipedia.org/w/api.php?action=query&titles=#{publishers}&prop=revisions&rvprop=content&format=json")
    result = find_values(response)
  end

  private

  def find_values(response)
    final_result = []

    items = ['logo', 'image_file', 'type', 'editor', 'owner', 'url', 'website',
      'launch date', 'launch_date', 'firstdate', 'author', 'founded']
    pages = response['query']['pages'].keys

    pages.each do |page|
      values = {}
      info_array = response['query']['pages'][page]['revisions'][0]['*'].split("|")
      values['name'] = response['query']['pages'][page]['title']
      idx = 0
      while values.keys.length < 8 && idx < 40
        items.each do |item|
          if info_array[idx][0...item.length + 1].include?(item)
            if item == 'logo' || item == 'image_file'
              if !values.key?('logo') && (info_array[idx].include?('.png') || info_array[idx].include?('.svg'))
                image_dir = parse_value(info_array[idx], item)
                name = values['name'].gsub(" ", "_")
                values['logo'] = "https://en.wikipedia.org/wiki/#{name}#/media/#{image_dir}"
              end
            elsif item == 'type'
              if !info_array[idx + 1].include?("=")
                has_equal_sign = false
                sub_idx = idx + 1
              else
                sub_idx = idx
                has_equal_sign = true
              end
              values[item] = parse_value(info_array[sub_idx], item, has_equal_sign)
            elsif item == 'url' || item == 'website'
              if info_array[idx].include?("URL")
                values['website'] = parse_value(info_array[idx + 1], 'url', false)
              else
                equals_idx = info_array[idx].index("=")
                if info_array[idx][equals_idx + 1] == "["
                  values['website'] = parse_value(info_array[idx], 'url')
                end
              end
            elsif item == 'launch date' || item == 'launch_date' || item == 'firstdate' || item == 'founded'
              values['launch_date'] = determine_launch_date(info_array, idx)
            elsif item == 'editor' || item == 'owner' || item == 'url'
              values[item] = parse_value(info_array[idx], item)
            end
          end
        end
        p values
        idx += 1
      end
      final_result << values
    end
    debugger
    final_result
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
    date
  end

  def parse_value(string, type, has_equal_sign = true)
    string.gsub!("\n", "")
    string.delete!("[]}")
    if has_equal_sign
      string = string.split("=")[1]
      string = string[1..-1] if string[0] == " "

      if type == 'logo' || type == 'image_file'
        string.gsub!(" ", "_")
        if type == 'image_file'
          string = "File:#{string}"
        end
      elsif type == 'owner'
        string = string.split("<br>")
      elsif type == 'url'
        string = string.split(" ")[0]
      end
    end
    string
  end
end
