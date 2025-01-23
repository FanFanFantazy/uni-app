import { defineConfig } from 'vite';
import fs from 'fs-extra';
import path from 'path';
import uni from '@dcloudio/vite-plugin-uni';
 
function copyFile() {
	return {
		enforce: 'post',
		async writeBundle() {
			await fs.copy(
				path.resolve(__dirname, 'functions'),
				path.join(
					__dirname,
					'unpackage/dist',
					process.env.NODE_ENV === 'production' ? 'build' : 'dev',
					process.env.UNI_PLATFORM,
					'functions'
				)
			);
		},
	};
}
 
export default defineConfig({
	plugins: [uni(),copyFile()],
});
