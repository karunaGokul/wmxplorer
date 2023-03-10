import { GlobalConfigurationModel, resoureLoaderState } from '@/model';
import { IBaseService, BaseService } from './base.service';

export interface IConfigurationService extends IBaseService<any, resoureLoaderState> {
    getGlobalConfiguration(): Promise<resoureLoaderState>;
}

export class ConfigurationService extends BaseService<any, resoureLoaderState> implements IConfigurationService {
    constructor() {
        super('resourceLoader', GlobalConfigurationModel)
    }
    getGlobalConfiguration(): Promise<resoureLoaderState>{
        return this.httpGet('resourceLoader', null).then(response => {
            return response.data;
        }); 
    }
}