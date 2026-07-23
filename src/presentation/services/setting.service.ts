import { SettingModel } from "../../data";
import { CustomError, UpdateSettingDto } from "../../domain";

export class SettingService {

    constructor() { }

    async getSettings() {
        try {
            let settings = await SettingModel.findOne();
            if (!settings) settings = await SettingModel.create({});

            return {
                id: settings.id,
                minOrderAmount: settings.minOrderAmount,
            };
        } catch (error) {
            throw CustomError.internarlServer(`${error}`);
        }
    }

    async updateSettings(updateSettingDto: UpdateSettingDto) {
        try {
            const settings = await SettingModel.findOneAndUpdate(
                {},
                { minOrderAmount: updateSettingDto.minOrderAmount },
                { new: true, upsert: true }
            );

            return {
                id: settings!.id,
                minOrderAmount: settings!.minOrderAmount,
            };
        } catch (error) {
            throw CustomError.internarlServer(`${error}`);
        }
    }
}
