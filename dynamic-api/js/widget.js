/**
* Xml Feed Javascript Api
* 
* Xml Feed Javascript Api can be used to display the latest feeds 
* from any website that has an xml feed url. Plugin have multiple options
* for customizing the widget appearance and url
*
*/

var XmlFeedGrabber = {
   options: {
      feedUrl: "",
      itemsCount: 5,
      targetId: "xml-grabber",
      openInNewWindow: true,
      showMedia: true,
      showDescription: false,
      currentTheme: "",
      loaderUrl: "img/loading.gif"
   },
   targetHtmlEle: "",
   messages: {
      missingTargetId: "please specify element target id",
      missingTargetHtml: "not found html element with the specified id",
      missingFeedUrl: "please specify your xml feed url",
      errorFetchingData: "Error reading data from the remote url"
   },
   themes: {
      default: {
         background: "#efe9e9",
         titleColor: "#000",
         dateColor: "#dadada",
         imgBorderColor: "#ddd",
         descriptionColor: "#000"
      },
      beige: {
         background: "#882d2d",
         titleColor: "#fff",
         dateColor: "#dadada",
         imgBorderColor: "#44af60",
         descriptionColor: "#000"
      },
      green: {
         background: "#10d010",
         titleColor: "#fff",
         dateColor: "#b90404",
         imgBorderColor: "#a97e1d",
         descriptionColor: "#000"
      },
      purple: {
         background: "#6310d0",
         titleColor: "#fff",
         dateColor: "#f7f3f3",
         imgBorderColor: "#a97e1d",
         descriptionColor: "#000"
      },
      dark: {
         background: "#000",
         titleColor: "#fff",
         dateColor: "#f7f3f3",
         imgBorderColor: "#a97e1d",
         descriptionColor: "#fff"
      }
   },
   setOptions: function(options) {
      if(options.feedUrl) {
         this.options.feedUrl = options.feedUrl;
      }

      if(options.itemsCount) {
         this.options.itemsCount = options.itemsCount;
      }

      if(options.targetId) {
         this.options.targetId = options.targetId;
      }

      if(options.openInNewWindow) {
         this.options.openInNewWindow = options.openInNewWindow;
      }

      if(options.showMedia) {
         this.options.showMedia = options.showMedia;
      }

      if(options.showDescription) {
         this.options.showDescription = options.showDescription;
      }

      if(options.currentTheme && this.themes[options.currentTheme] != undefined) {
         this.options.currentTheme = this.themes[options.currentTheme];
      }

      if(options.loaderUrl) {
         this.options.loaderUrl = options.loaderUrl;
      }
   },
   validate: function () {

      if(!this.options.targetId) {

         console.log(this.messages.missingTargetId);

         return false;
      }

      if(!this.options.feedUrl) {

         console.log(this.messages.missingFeedUrl);

         return false;
      }

      this.targetHtmlEle = document.getElementById(this.options.targetId);

      if(!this.targetHtmlEle) {

         console.log(this.messages.missingTargetHtml);

         return false;
      }

      return true;
   },
   render: function() {

      var self = this;

      if(!this.validate()) {

         return;
      }
                
      // show loader
      self.targetHtmlEle.innerHTML = '<img class="xml-grabber-loader" src="'+ this.options.loaderUrl +'" />';

      // apply styling
      self.applyCss();

      // fetch data
      this.fetch(function(response) {

         var json = JSON.parse(response);

            if(json.state == 1) {

                self.targetHtmlEle.innerHTML = self.template(json.data);

            } else {

                console.log(self.messages.errorFetchingData);
            }

      });
   },
   fetch: function(callback) {

      if (window.XMLHttpRequest) {
         var xhr = new XMLHttpRequest();
      } else {
         var xhr = new ActiveXObject("Microsoft.XMLHTTP");
      }

      xhr.addEventListener("readystatechange", function () {
         if (this.readyState === 4 && this.status === 200) {
            callback(this.responseText);
         }
      });

      var params = "url=" + encodeURIComponent(this.options.feedUrl) + "&itemsCount=" + this.options.itemsCount + "&showDescription=" + this.options.showDescription + "&showMedia=" + this.options.showMedia;

      xhr.open("POST", "./fetch.php");
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.setRequestHeader("dataType", "application/json");
      xhr.send(params);
   },
   template: function(response) {

      var self = this;

      var html = '<ul class="xml-grabber-items">';

      response.forEach(function(element) {

         html += '<li class="xml-grabber-item">';

         html += '<a href="' + element.link + '" target="' + (self.openInNewWindow == true?"_blank":"self")  + '">';

         if(element.media !== undefined) {

             html += '<img src="' + element.media + '" width="100px" height="80px" />';
         }

         html += '<span class="xml-grabber-title">' + element.title + '</span>';

         html += '</a>';

         if(element.pubDate !== undefined) {
             html += '<span class="xml-grapper-date">' + element.pubDate + '</span>';
         }

         if(element.description !== undefined) {
             html += '<span class="xml-grabber-description">' + decodeURIComponent(element.description) + '</span>';
         }

         html +'</li>';

      });

      html += '</ul>';

      return html;
   },
   applyCss: function() {

      if(this.options.currentTheme == "") {

         this.options.currentTheme = this.themes["default"];
      }

      var rules = "ul.xml-grabber-items { list-style-type: none; }";

      rules += "#xml-grabber { border: 1px solid #908787; border-radius: 7px; background: " + this.options.currentTheme.background + "; }"

      rules += "li.xml-grabber-item { margin-bottom: 48px; border-bottom: 1px solid #ccc; }";

      rules += "li.xml-grabber-item a { text-decoration: none; }";

      rules += "li.xml-grabber-item img { border: 3px solid " + this.options.currentTheme.imgBorderColor + "; }";

      rules += ".xml-grabber-title { vertical-align: top; margin-left: 8px; color: " + this.options.currentTheme.titleColor + "; font-family: sans-serif; font-weight: bold; }";

      rules += ".xml-grabber-description { font-size: 15px; font-family: sans-serif; color: " + this.options.currentTheme.descriptionColor + " }";

      rules += ".xml-grapper-date { color: " + this.options.currentTheme.dateColor + "; font-size: 11px; display: block; }";

      var styleTag = document.createElement('style');
          
      styleTag.type = 'text/css';
          
      styleTag.appendChild(document.createTextNode(rules));
          
      document.head.appendChild(styleTag);
    }
}