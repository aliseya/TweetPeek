/**
 * 
 * TweetPeek is a class for rendering tweets to and from a single twitter user id. 
 * 
 *@author aliseya  - http://www.aliseya.com
 * 
 */
//Global namespace
TweetPeekLib = {};

/**
 *
 * @constructor
 * @param {HTML DIV} renderingDiv   the element to render the tweets in. The created tweet box will inherit the width from this div
 * @param {string} twitterID the twitter id of the user whose conversation is to be viewed
 * @param {number} numToShow (OPTIONAL) number of tweets to show. The height of the display is based off of this value
 * @param {number} speed_ms (OPTIONAL) the delay between item scrolls in milliseconds
 * @param {string} linkClass (OPTIONAL) a css class for links in the tweet
 * @param {string} imgClass (OPTIONAL) a css class to be used for the twitter user profile images
 */

TweetPeekLib.tweetPeek = function (renderingDiv, twitterID, numToShow, speed_ms, linkClass, imgClass) {


    var tweet_list, startPoint, slideInterval, holder_div = renderingDiv,
        tweet_box, tweet_holder, linkStyle = linkClass,
        imgStyle = imgClass,
        twitter_user = twitterID,
        num_visible = numToShow,
        speed = speed_ms,
        twitter_query;



    //check speed
    if (isNaN(speed) || typeof speed !== "number") {

        speed = 6000;
    }
    if (isNaN(num_visible) || typeof num_visible !== "number") {

        num_visible = 1;
    }

    //strip off the @ if it was included 
    if (twitter_user.charAt(0) === "@") {
        twitter_user = twitter_user.substring(1, twitter_user.length);
    }

    //create the holder div 
    var boxHeight = (num_visible * 60) - 2;
    tweet_holder = document.createElement('div');
    tweet_holder.style.overflow = "hidden";
    tweet_holder.style.height = boxHeight + "px"
    tweet_holder.style.width = "inherit";
    tweet_holder.style.position = "relative";
    tweet_holder.style.top = "0px";

    tweet_box = document.createElement('div');
    tweet_box.style.position = "relative";
    tweet_box.style.top = "-62px"

    tweet_holder.appendChild(tweet_box);
    holder_div.appendChild(tweet_holder);


    var printTweets = function () {

            startPoint++;
            if (startPoint >= tweet_list.length) {
                startPoint = 0;
            }

            var index = startPoint;
            var count = 1;
            var tweetInnerHTML = "";
            for (count = 0; count <= num_visible; count++) {

                tweetInnerHTML = formatTweet(tweet_list[index]) + tweetInnerHTML;
                index++;
                if (index >= tweet_list.length) {
                    index = 0;
                }
            }

            //only modify DOM once. 
            tweet_box.innerHTML = tweetInnerHTML;

            setTimeout(slideTweets, speed);
        };

    var formatTweet = function (tweetObj) {

            var text = tweetObj.text;
            var tArray = tweetObj.text.split(" ");
            var c = 0;
            for (c = 0; c < tArray.length; c++) {
                //if only one char, continue 
                //if last char is :, strip it from the link 
                var tempT = tArray[c];
                if (tempT.charAt(0) === "@" && tempT.length > 1) {
                    var link = tempT;
                    if (tempT.charAt(tempT.length - 1) === ":") {
                        link = tempT.substring(0, tempT.length - 1);
                    }
                    tArray[c] = "<a href=\"http://twitter.com/" + link + "\" class=\"" + linkStyle + "\" target=\"_blank\">" + tempT + "</a>";
                }
                if (tempT.indexOf("http://") === 0) {
                    tArray[c] = "<a href=\"" + tempT + "\" class=\"" + linkStyle + "\" target=\"_blank\">" + tempT + "</a>";
                }
                text = tArray.join(" ");
            }
            var rs = "<div style=\"height:60px; overflow:hidden;\">";
            rs += "<table height=\"60px\" cellpadding=\"0\" cellspacing=\"0\"><tr valign=\"top\"><td width=\"60px\"><a class=\"" + linkStyle + "\" href=\"http://twitter.com/" + tweetObj.from_user + "\" target=\"_blank\"><img class=\"" + imgStyle + "\" src=\"" + tweetObj.profile_image_url + "\"/></a></td>";
            rs += "<td style=\"padding-top:4px;\"><a class=\"" + linkStyle + "\" href=\"http://twitter.com/" + tweetObj.from_user + "\" target=\"_blank\">" + tweetObj.from_user + "</a><br/>" + text + "</td></tr></table>";
            rs += "</div>";
            return rs;
        };

    var slideTweets = function () {
            var pos = tweet_box.style.top;
            pos = parseInt(pos, 10);
            pos += 10;
            tweet_box.style.top = pos + "px";

            //transition is complete
            if (pos >= -5) {
                pos = -5;
                tweet_box.style.top = pos + "px";

                printTweets();
                tweet_box.style.top = "-62px";
            } else {
                setTimeout(slideTweets, 25);
            }
        };



    var publicMethods = {

        /**
         *  load the tweets for the set userid. uses the official twitter jsonp api
         */
        loadTweets: function () {

            var loaderCallback = 'tweetsLoaded' + twitter_user + new Date().getTime();
            window.TweetPeekLib[loaderCallback] = (function (data) {

                try {
                    tweet_list = data.results;
                    startPoint = tweet_list.length - 1;
                    printTweets();
                } catch (e) {
                    //invalid data
                }
            });

            //make the twitter jsonp request
            var newScript = document.createElement('script');
            newScript.type = 'text/javascript';
            twitter_query = "http://search.twitter.com/search.json?q=from:" + twitter_user + "+OR+@" + twitter_user + "&rpp=20&callback=TweetPeekLib." + loaderCallback;
            newScript.src = twitter_query;
            tweet_box.appendChild(newScript);
        },



    };

    return publicMethods;

};