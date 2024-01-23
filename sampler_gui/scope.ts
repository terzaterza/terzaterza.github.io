interface ScopeAnalogHardware {
    adcs_available: number;
    channels_per_adc: 1|2;
    buff_len_per_ch: number;
}

interface ScopeAnalogConfig {
    sample_rate: number; /* In samples per second */
    sample_size: 1|2; /* In bytes - 2 for ADC res > 8 bit */
    active_channels: number;
}

enum ScopeSerialResponse {
    OK = 0,
    BUSY = 1,
    ERROR = 2
}

enum ScopeSerialCommand {
    ANALOG_TRIGGER = 0,
}

class Scope {
    private port: any = null;
    private hardware_config: ScopeAnalogHardware;
    private analog_config: ScopeAnalogConfig;

    constructor(hardware_config: ScopeAnalogHardware) {
        this.hardware_config = hardware_config;
        this.analog_config = {
            sample_rate: 1,
            sample_size: 2,
            active_channels: 1
        };
    }

    async port_connect() {
        const filters = [
            { usbVendorId: 0x0483, usbProductId: 0x374b }, /* STM32L476RG */
        ];

        try {
            // @ts-expect-error
            const port = await navigator.serial.requestPort({filters});
            await port.open({ baudRate: 115200 });
            this.port = port;
            this.start_receive_handler()
                .then(() => {
                    console.log("Receive handler exited while loop");
                })
                .catch((e) => {
                    console.log("Port receive process error");
                });
        } catch (e) {
            console.log("Couldn't connect to scope device!");
        }
    }

    port_info() {
        console.assert(this.port != null);
        return this.port.getInfo();
    }

    async port_read_bytes(length: number): Promise<ArrayBuffer> {
        const reader = this.port.readable.getReader({ mode: "byob" });
        
        let buffer: ArrayBuffer = new ArrayBuffer(length);
        let offset: number = 0;
        while (offset < length) {
          const { value, done } = await reader.read(
            new Uint8Array(buffer, offset)
          );
          if (done) {
            break;
          }
          buffer = value.buffer;
          offset += value.byteLength;
        }
        reader.releaseLock();
        return buffer;
    }

    async handle_command(command: ScopeSerialCommand) {
        switch (command) {
            case ScopeSerialCommand.ANALOG_TRIGGER:
                console.log("Scope analog trigger!");
                const message_format = new Uint16Array(await this.port_read_bytes(16));
                const sample_rate = message_format[0] + (message_format[1] << 16);
                const sample_size = message_format[2] as (1 | 2);
                const buff_len_per_ch = message_format[3];
                const trigger_position = message_format[4];
                const trigger_level = message_format[5];
                const buffer_count = message_format[6];

                let parsed_samples: Uint16Array[] = [];
                for (let buff = 0; buff < buffer_count; buff++) {
                    const buffer_channels = new Uint16Array(await this.port_read_bytes(2))[0] as (1 | 2);
                    const buffer_size = buff_len_per_ch * buffer_channels * sample_size;
                    const buffer_recv = new Uint8Array(await this.port_read_bytes(buffer_size));
                    const buffer_parsed = parse_analog_sample_block(buffer_recv, sample_size, buffer_channels);
                    parsed_samples.push(...buffer_parsed);
                }
                analog_plot_samples(parsed_samples, trigger_position, trigger_level, sample_rate);
                break;
            default:
                console.warn("Scope serial command not recognized!");
        }
    }

    async start_receive_handler() {
        while (1) {
            const command = new Uint8Array(await this.port_read_bytes(1))[0] as ScopeSerialCommand;
            try {
                await this.handle_command(command);
            } catch (e) {
                console.warn("Error handling the command");
            }
        }
    }
}

function parse_analog_sample_block(block: Uint8Array, sample_size:1|2=2, channels:1|2=2): Uint16Array[] {
    const samples_per_ch = block.length / sample_size / channels;
    console.assert(Math.trunc(samples_per_ch) == samples_per_ch);

    let out_samples: Uint16Array[] = new Array(channels).fill(null).map((v) => new Uint16Array(samples_per_ch));
    for (let s = 0; s < samples_per_ch; s++) {
        for (let ch = 0; ch < channels; ch++) {
            const block_pos = (s * channels + ch) * sample_size;
            out_samples[ch][s] = block[block_pos];
            if (sample_size > 1) {
                out_samples[ch][s] += 256 * block[block_pos+1];
            }
        }
    }

    return out_samples;
}

function test_parse_analog_sample_block(): void {
    const analog_range: [number, number] = [0, 3.3];
    const sample_size: 1|2 = 2;
    const channels: 1|2 = 2;
    const sample_count: number = 64;
    const sample_block: Uint8Array = new Uint8Array(sample_count * sample_size * channels);

    const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(value, min));
    const adc = (value: number, min: number, max: number, bits: number) =>
        clamp(Math.round((value - min) / (max - min) * Math.pow(2, bits)), 0, Math.pow(2, bits)-1);

    for (let i = 0; i < sample_count; i++) {
        const analog_sample_0: number = Math.sin(i * 0.2) + 1.4;
        const analog_sample_1: number = Math.cos(i * 0.2) + 1.2;
        const digital_sample_0: number = adc(analog_sample_0, analog_range[0], analog_range[1], 12);
        const digital_sample_1: number = adc(analog_sample_1, analog_range[0], analog_range[1], 12);
        sample_block[i * sample_size * channels + 0] = digital_sample_0 & 255;
        sample_block[i * sample_size * channels + 1] = digital_sample_0 >> 8;
        sample_block[i * sample_size * channels + 2] = digital_sample_1 & 255;
        sample_block[i * sample_size * channels + 3] = digital_sample_1 >> 8;
    }
    
    const result = parse_analog_sample_block(sample_block, sample_size, channels);
    analog_plot_samples(result, 16);
}
