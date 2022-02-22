<?php
header('Content-Type: application/json; charset=utf-8');

$params = file_get_contents("php://input");

parse_str($params, $paramArray);

$url = $paramArray['url'];

$itemsCount = $paramArray['itemsCount'] > 0 ? $paramArray['itemsCount'] : 5;

$showDescription = $paramArray['showDescription'];

$showMedia = $paramArray['showMedia'];


try {
    $curl = curl_init();

    curl_setopt_array($curl, array(
      CURLOPT_URL => $url,
      CURLOPT_RETURNTRANSFER => true,
      CURLOPT_ENCODING => "",
      CURLOPT_MAXREDIRS => 10,
      CURLOPT_TIMEOUT => 30,
      CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
      CURLOPT_CUSTOMREQUEST => "GET"
    ));

    $response = curl_exec($curl);
    $err = curl_error($curl);

    curl_close($curl);

    if ($err) {
      throw new Exception($err);
    } else {

        $simpleXmlObj = new SimpleXmlElement($response);

        $namespaces = $simpleXmlObj->getNamespaces(true);

        $items = [];

        $counter = 0;

        foreach($simpleXmlObj->channel->item as $entry) {
                
            if($counter == $itemsCount) break;

            $arr['title'] = (string) $entry->title;

            $arr['link'] = (string) $entry->link;


            if(isset($entry->pubDate)) {
                $arr['pubDate'] = (string) $entry->pubDate;
            }

            if($showDescription == 'true') {
                $arr['description'] = mb_substr(str_replace("'", "", str_replace('"', "", (string) $entry->description)), 0, 150, "utf-8") . "...";
            }

            if($showMedia) {
                if(isset($namespaces['media']) && $entry->children($namespaces['media']) !== null) {
                    $arr['media']= (string) 
                            $entry->children($namespaces['media'])->content->attributes()->url;
                } else if(isset($entry->enclosure) && isset($entry->enclosure->attributes()['url'])) {
                    $arr['media']= (string) $entry->enclosure->attributes()['url'];
                } else if(isset($entry->image) && isset($entry->image->url)) {

                    $arr['media']= (string) $entry->image->url;
                }
            }

            $items[] = $arr;

            $counter++;
        }

      echo json_encode(['state' => 1, 'data' => $items]);
    }
} catch(Exception $e) {
    echo json_encode(['state' => 0, 'data' => $e->getMessage()]);
}