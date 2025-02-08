<template>
	<view>
		<view class="chat-container">
			<view v-for="(message, index) in messages" :key="index">
				<view :class="'avatar ' + message.sender + '-avatar'"></view>
				<text class="user-name long-text">{{message.sender}}</text>
				<view :class="message.sender + ' chat-box'">{{ message.text }}</view>
			</view>
			<view class="empty-space"></view>
		</view>
		<view class="chat-input">
			<textarea v-model="userInput" maxlength="-1" auto-height="true" class="att-textarea"
			placeholder="Please enter..." placeholder-class="placeholder" cursor-spacing="100" :fixed="true"
			></textarea>
			<view :class="!loading && userInput ? 'add-btn' : 'disable-btn'" @click="sendMessage">Send</view>
		</view>
	</view>
	<Login></Login>
</template>

<script setup>
	import { onMounted, reactive, ref, watch } from 'vue'
	// user login
	import { login_user } from '@/common/answer.js'
	import Login from '@/pages/components/login.vue' 
	
	const user = ref(false)
	onMounted(() => {
		if (checkUserLogin()) {
			user.value = true
			getProjectList()
		}
	})
	watch(() => login_user.response, (newVal, oldVal) => {
		user.value = newVal
		getProjectList()
	})
	function checkUserLogin() {
		if (!wx.getStorageSync('user_info')) {
			login_user.show = true
			return false
		}
		return true
	}
	
	const messages = reactive([])
	const userInput = ref('')
	const loading = ref(false)

	// sendMessage
	function sendMessage() {
		if (!loading.value && userInput.value) {
			wx.showLoading()
			loading.value = true
			messages.push({ sender: 'user', text: userInput.value })
			wx.request({
				url: 'https://api.deepseek.com/v1/chat/completions',
				method: 'POST',
				header: {
					'Accept': 'application/json', 
					'Content-Type': 'application/json',
					'Authorization': 'Bearer sk-67adf783612143bb9cf3c2c083ac91d7'
				},
				data: {
					messages: [{ role: "user", content: userInput.value }],
					model: "deepseek-chat",
					frequency_penalty: 0,
					max_tokens: 2048,
					presence_penalty: 0,
					response_format: {
						type: "text"
					},
					stop: null,
					stream: false,
					stream_options: null,
					temperature: 1,
					top_p: 1,
					tools: null,
					tool_choice: "none",
					logprobs: false,
					top_logprobs: null,
					timeout: 100000,
				},
				success: function(res) {
					console.log(res)
					let botMessage = ''
					if (res.data.choices.length > 0) {
						res.data.choices.forEach(el => {
							botMessage += el.message.content
						})
					}
					messages.push({ sender: 'bot', text: botMessage })
					userInput.value = ''
				},
				fail: function() {
					messages.push({ sender: 'bot', text: 'Sorry, please try again' })
				},
				complete: function() {
					wx.hideLoading()
					loading.value = false
				}
			})
		}

	}


</script>
<style scoped>
.chat-container {
  padding: 16rpx;
  overflow-y: auto;
}
.user {
  color: #409EFF;
}
.bot {
  color: #67C23A;
}
.chat-box{
	padding: 16rpx;
    border: 1rpx solid #eeeeee;
    border-radius: 16rpx;
	margin: 16rpx 0;
	word-break: break-word;
	white-space: break-spaces;
}
.chat-input {
    bottom: 0;
    position: fixed;
    width: 100%;
    margin-bottom: 16rpx;
}
.empty-space {
	height: 356rpx;
	width: 100%;
	display: block;
}
.avatar {
	text-align: center;
	display: inline-block;
	width: 30rpx;
	height: 30rpx;
	border-radius: 50%;
	border: 1px solid #EBEEF5;
	vertical-align: middle;
}
.user-avatar {
	background-color: #409EFF;
}
.bot-avatar {
	background-color: #67C23A;
}
.user-name {
	line-height: 30rpx;
	vertical-align: middle;
	display: inline-block;
	color: #909399;
	margin-left: 16rpx;
}
</style>

