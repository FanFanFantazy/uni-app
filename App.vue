<script>
	export default {
		onLaunch: function() {
			if (!wx.cloud) {
				console.log('微信云加载失败!')
			} else {
				console.log('微信云加载成功!')
				wx.cloud.init({
					//env 云环境 ID
					env: 'test-2geit0kxfc5c1e8e',
					traceuser: true
				})
			}
		}
	}
	
</script>

<style>
	/*每个页面公共css */
	@import url('@/static/myicon.css');
</style>
