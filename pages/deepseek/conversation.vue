<template>
	<view>
		<view class="chat-container">
			<view v-for="(message, index) in messages" :key="index">
				<view :class="'avatar ' + message.sender + '-avatar'"></view>
				<text class="user-name long-text">{{message.sender}}</text>
				<towxml :nodes="transToMd(message.text, 'markdown')"></towxml>
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
	import { useTowxml } from '@/wxcomponents/towxml/index.js'
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
	const currentMsg = ref('')

	// sendMessage
	function sendMessage() {
		if (!loading.value && userInput.value) {
			wx.showLoading()
			loading.value = true
			messages.push({ sender: 'user', text: userInput.value })
			wx.request({
				url: 'https://api.deepseek.com/v1/chat/completions',
				method: 'POST',
				responseType: 'stream',
				header: {
					'Content-Type': 'application/json',
					'Authorization': 'Bearer sk-67adf783612143bb9cf3c2c083ac91d7'
				},
				data: {
					messages: [{ role: "user", content: userInput.value }],
					model: "deepseek-chat",
					stream: true,
                    max_tokens: 2048,
                    temperature: 0.7,
                    top_p: 0.7,
                    top_k: 50,
                    frequency_penalty: 0.5,
                    n: 1,
					timeout: 100000,
                    response_format: {
                        type: 'text'
                    }
				},
				success: function(res) {
					currentMsg.value = handleStream(res)
					messages.push({ sender: 'bot', text: currentMsg.value })
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
	// handleStream
	function handleStream(res) {
		let botMessage = ''
		const lines = res.data.toString().split('\n');
		for (const line of lines) {
			if (line.trim() === '') continue;
			if (line.trim() === 'data: [DONE]') continue;
			if (line.startsWith('data: ')) {
				try {
					const json = JSON.parse(line.slice(6));
					if (json.choices[0].delta.content) {
						botMessage += json.choices[0].delta.content;
					}
				} catch (e) {
					continue;
				}
			}
		}
		return botMessage
	}
	// markdown
	function transToMd(content, type) {
		return useTowxml(content.toString(), type)
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

