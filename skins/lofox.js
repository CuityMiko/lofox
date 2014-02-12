/**
 * @author bh-lay
 *  
 *  location fox
 */
window.util = window.util || {};

(function(exports){
	//格式化search
	function searchParser(search){
		var resultObj = {};
		if(search && search.length > 1){
			var items = search.split('&');
			for(var index = 0 ; index < items.length ; index++ ){
				if(! items[index]){
					continue;
				}
				var kv = items[index].split('=');
				resultObj[kv[0]] = typeof kv[1] === "undefined" ? "":kv[1];
			}
		}
		return resultObj;
	}
	//格式化url
	function pathParser(url){
		var url = url || window.location.pathname+window.location.search+window.location.hash;

		var urlSplit = url.length>0 ? url.split(/\?/) : ['',''];
		
		var urlStr = urlSplit[0].split('#')[0];
		var searchStr = urlSplit[1];
		//去除首尾的‘/’
		urlStr = urlStr.replace(/^\/*|\/*$/g,'');
		var pathData = urlStr.split(/\//);
		
		if(pathData.length == 1 && pathData[0] == ''){
			pathData = [];
		}
		
		var searchData = searchParser(searchStr);
		
		return {
			'pathnode' : pathData,
			'search' : searchData
		};
	}
	
	var HTML5 = function(){
		var this_fox = this;
		
		window.addEventListener('popstate',function(e){
			//console.log(e);
			var state = e.state || {};
			//console.log('from popstate event !',state);
			var url = state.url || null;
			//清除第一次不确定性的触发
			if(url){
				this_fox.refresh(url);
			}
			return false;
		});
		this.push = function(url){
			window.history.pushState({
				url: url
			},'test',url);
		}
	};	
	var HASH = function(){
		var this_fox = this;
		var hash = window.location.hash;
		setInterval(function(){
			var new_hash = window.location.hash||'#';
			if(new_hash != hash){
				hash = new_hash;
				var url = hash.replace(/^#/,'');
			}
		},30);
		
		this.push = function(url){
			this.url = url;
			window.location.hash = url;
		}
	}

	function EMIT(eventName,args){
		//事件堆无该事件，结束运行
		if(!this.events[eventName]){
			return
		}
		for(var i=0,total=this.events[eventName].length;i<total;i++){
			this.events[eventName][i].apply(this,args);
		}
	}
	function LOFOX(){
		var this_fox = this;
		this.events = {};
		this.push = null;
		
		if(window.history&&window.history.pushState){
			HTML5.call(this);
		}else{
			HASH.call(this);
		}
		//为异步接口
		setTimeout(function(){
			this_fox.refresh();
		},10);
	}
	LOFOX.prototype = {
		'on' : function ON(eventName,callback){
			//事件堆无该事件，创建一个事件堆
			if(!this.events[eventName]){
				this.events[eventName] = [];
			}
			this.events[eventName].push(callback);
		},
		'refresh' : function (url){
			var urlData = pathParser(url);
			EMIT.call(this,'change',[urlData['pathnode'],urlData['search']]);
		},
		'urlParse' : function(url){
			var urlData = pathParser(url);
			return urlData;
		}
	};
	
	exports.lofox = function(){
		return new LOFOX()
	};
})(window.util);